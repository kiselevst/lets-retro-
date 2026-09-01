import { supabase } from './supabase';
import type { CardRow, CardSource, MergeUndoSnapshot } from './types';

const MERGE_SEPARATOR = '\n───────\n';

export async function addCard(
  boardId: string,
  columnId: string,
  participantId: string,
  text: string,
): Promise<void> {
  const { error } = await supabase.from('cards').insert({
    board_id: boardId,
    column_id: columnId,
    author_participant_id: participantId,
    text,
    position: Date.now(),
  });
  if (error) throw error;
}

export async function updateCardText(cardId: string, text: string): Promise<void> {
  const { error } = await supabase.from('cards').update({ text }).eq('id', cardId);
  if (error) throw error;
}

export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) throw error;
}

/**
 * Склейка карточек (drag&drop одной на другую внутри столбца). Голоса ОБЕИХ
 * карточек (и цели, и источника) сбрасываются — склеенная карточка стартует
 * "с нуля", чтобы не было путаницы, чьи голоса на ней остались. Полный
 * снимок состояния до склейки (текст цели + кто голосовал за обе карточки)
 * сохраняется в last_merge_snapshot — это единственное, что позволяет
 * unmergeCard() честно всё восстановить. Разъединить можно только
 * ПОСЛЕДНЮЮ склейку: при повторной склейке снимок перезаписывается.
 */
export async function mergeCards(
  source: CardRow,
  target: CardRow,
  sourceAuthorName: string,
  targetVoterIds: string[],
  sourceVoterIds: string[],
): Promise<void> {
  const additionalSources: CardSource[] = source.sources.length
    ? source.sources
    : [{ text: source.text, author: sourceAuthorName }];

  const snapshot: MergeUndoSnapshot = {
    targetTextBefore: target.text,
    targetVoterIds,
    source: {
      text: source.text,
      author: sourceAuthorName,
      authorParticipantId: source.author_participant_id,
      voterIds: sourceVoterIds,
      createdAt: source.created_at,
      color: source.color,
    },
  };

  const { error: updateError } = await supabase
    .from('cards')
    .update({
      text: `${target.text}${MERGE_SEPARATOR}${source.text}`,
      sources: [...target.sources, ...additionalSources],
      last_merge_snapshot: snapshot,
    })
    .eq('id', target.id);
  if (updateError) throw updateError;

  await supabase.from('votes').delete().eq('card_id', target.id);

  const { error: deleteError } = await supabase.from('cards').delete().eq('id', source.id);
  if (deleteError) throw deleteError;
}

/**
 * Разъединение: откатывает ПОСЛЕДНЮЮ склейку карточки — текст и голоса цели
 * возвращаются к состоянию из снимка, а источник пересоздаётся отдельной
 * карточкой со своими исходными голосами. Дальше в истории (более ранние
 * склейки, если были) этим способом не достать — снимок хранит только
 * последний шаг.
 */
export async function unmergeCard(boardId: string, card: CardRow): Promise<void> {
  const snapshot = card.last_merge_snapshot;
  if (!snapshot) throw new Error('У этой карточки нет склейки, которую можно отменить');

  const restoredSources = card.sources.slice(0, -1);

  const { error: restoreTargetError } = await supabase
    .from('cards')
    .update({
      text: snapshot.targetTextBefore,
      sources: restoredSources,
      last_merge_snapshot: null,
    })
    .eq('id', card.id);
  if (restoreTargetError) throw restoreTargetError;

  await supabase.from('votes').delete().eq('card_id', card.id);
  if (snapshot.targetVoterIds.length > 0) {
    const { error: restoreVotesError } = await supabase.from('votes').insert(
      snapshot.targetVoterIds.map((participantId) => ({
        board_id: boardId,
        card_id: card.id,
        participant_id: participantId,
      })),
    );
    if (restoreVotesError) throw restoreVotesError;
  }

  const { data: restoredSource, error: insertError } = await supabase
    .from('cards')
    .insert({
      board_id: boardId,
      column_id: card.column_id,
      author_participant_id: snapshot.source.authorParticipantId,
      text: snapshot.source.text,
      color: snapshot.source.color,
      position: Date.now(),
    })
    .select('id')
    .single();
  if (insertError) throw insertError;

  if (snapshot.source.voterIds.length > 0) {
    const { error: sourceVotesError } = await supabase.from('votes').insert(
      snapshot.source.voterIds.map((participantId) => ({
        board_id: boardId,
        card_id: restoredSource.id,
        participant_id: participantId,
      })),
    );
    if (sourceVotesError) throw sourceVotesError;
  }
}

/**
 * Создание экшн-айтема из карточки: сама карточка-источник остаётся на месте
 * (получает пометку merged_into — на неё её "стало экшеном"), рядом
 * создаётся новая карточка в столбце "Что делаем" с тем же текстом,
 * которую дальше можно оформить по SMART.
 */
export async function createActionFromCard(
  boardId: string,
  actionsColumnId: string,
  source: CardRow,
  participantId: string,
  sourceAuthorName: string,
): Promise<CardRow> {
  const sources: CardSource[] = source.sources.length
    ? source.sources
    : [{ text: source.text, author: sourceAuthorName }];

  const { data, error } = await supabase
    .from('cards')
    .insert({
      board_id: boardId,
      column_id: actionsColumnId,
      author_participant_id: participantId,
      text: source.text,
      sources,
      position: Date.now(),
    })
    .select('*')
    .single();
  if (error) throw error;

  const { error: linkError } = await supabase
    .from('cards')
    .update({ merged_into: data.id })
    .eq('id', source.id);
  if (linkError) throw linkError;

  return data as CardRow;
}

export async function saveSmart(
  cardId: string,
  fields: { text: string; smartSuccess: string; smartOwner: string; smartDeadline: string },
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      text: fields.text,
      smart_success: fields.smartSuccess || null,
      smart_owner: fields.smartOwner || null,
      smart_deadline: fields.smartDeadline || null,
    })
    .eq('id', cardId);
  if (error) throw error;
}

export async function toggleCardDone(cardId: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('cards').update({ done }).eq('id', cardId);
  if (error) throw error;
}
