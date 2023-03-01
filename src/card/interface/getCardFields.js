/* @flow */

import { FRAME_NAME } from '../../constants';
import type { Card } from '../types';

import { getExportsByFrameName } from './getExportsByFrameName';
import { getCardFrames } from './getCardFrames';

export function getCardFields(): Card {
  const card = {}
  const cardFrame = getExportsByFrameName(FRAME_NAME.CARD_FIELD);

  if (cardFrame && cardFrame.isFieldValid()) {
    return cardFrame.getFieldValue();
  }

  const {
    cardNumberFrame,
    cardCVVFrame,
    cardExpiryFrame,
    cardNameFrame,
    cardPostalFrame
  } = getCardFrames();

  if (
    cardNumberFrame &&
    cardNumberFrame.isFieldValid() &&
    cardCVVFrame &&
    cardCVVFrame.isFieldValid() &&
    cardExpiryFrame &&
    cardExpiryFrame.isFieldValid()
    ) {
      card.number = cardNumberFrame.getFieldValue()
      card.cvv = cardCVVFrame.getFieldValue()
      card.expiry = cardExpiryFrame.getFieldValue()
    } else {
      throw new Error(`Card fields not available to submit`);
    }

  // cardNameFrame and cardPostalFrame are optional fields so we only want to check the validity if they are rendered.
  if ( cardNameFrame && cardNameFrame.isFieldValid() ) {
    card.name = cardNameFrame.getFieldValue()
  }

  if (cardPostalFrame && cardPostalFrame.isFieldValid()) {
    card.postalCode = cardPostalFrame.getFieldValue()
  }

  return card

}
