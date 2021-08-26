import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize, useWindowDimensions } from 'react-native';

export enum Orientation {
  Portrait,
  Landscape,
}

const computeOrientation = (windowDimensions: ScaledSize): Orientation => {
  return windowDimensions.height >= windowDimensions.width
    ? Orientation.Portrait
    : Orientation.Landscape;
};

export const useOrientation = (): Orientation => {
  const windowDimensions = useWindowDimensions();
  return computeOrientation(windowDimensions);
};
