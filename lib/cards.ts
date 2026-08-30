import { supabase } from './supabase';
import type { CardRow, CardSource } from './types';

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
 * Склейка карточек (drag&drop одной на другую внутри столбца): текст
 * источника дописывается к цели через разделитель, источники накапливаются
 * в поле sources для истории, сама карточка-источник удаляется целиком.
 *
 * Осознанное упрощение: голоса источника при этом теряются (удаляются
 * каскадно вместе с карточкой), а не переносятся на цель — перенос голосов
 * потребовал бы аккуратной дедупликации (что если один и тот же участник
 * успел проголосовать за обе карточки), а склейка обычно происходит на
 * этапе группировки идей, до серьёзного голосования.
 */
export async function mergeCards(
  source: CardRow,
  target: CardRow,
  sourceAuthorName: string,
): Promise<void> {
  const additionalSources: CardSource[] = source.sources.length
    ? source.sources
    : [{ text: source.text, author: sourceAuthorName }];

  const { error: updateError } = await supabase
    .from('cards')
    .update({
      text: `${target.text}${MERGE_SEPARATOR}${source.text}`,
      sources: [...target.sources, ...additionalSources],
    })
    .eq('id', target.id);
  if (updateError) throw updateError;

  const { error: deleteError } = await supabase.from('cards').delete().eq('id', source.id);
  if (deleteError) throw deleteError;
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
