"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "./styles.module.css";

interface SliderProps {
  min?: number;
  max?: number;
  rangeValues?: number[];
}

let SLIDER_WIDTH_PX;
let BULLET_WIDTH_PX;

export default function Slider(props: SliderProps) {
  const { min, max, rangeValues } = props;
  const initMin = rangeValues ? rangeValues[0] : min;
  const initMax = rangeValues ? rangeValues[rangeValues.length - 1] : max;
  const total = initMax;

  const [minValue, setMinValue] = useState(initMin);
  const [maxValue, setMaxValue] = useState(initMax);
  const [minBulletPositionPX, setMinBulletPositionPX] = useState(0);
  const [maxBulletPositionPX, setMaxBulletPositionPX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBullet, setSelectedBullet] = useState(null);
  const [rangeValuesLocations, setRangeValuesLocations] = useState([]);

  const slider = useRef<HTMLDivElement>(null);
  const minBullet = useRef<HTMLDivElement>(null);
  const maxBullet = useRef<HTMLDivElement>(null);

  const MIN_BULLET_ID = "minBullet";
  const MAX_BULLET_ID = "maxBullet";

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    initializeBulletLocation();
    if (rangeValues) {
      initializeRangeValuesLocations();
    }
  }, []);

  const initializeRangeValuesLocations = () => {
    let rangeValuesLocationsPX = rangeValues
      .sort((a, b) => a - b)
      .map((number) =>
        Math.round((number * SLIDER_WIDTH_PX) / total - BULLET_WIDTH_PX)
      );

    setRangeValuesLocations(rangeValuesLocationsPX);
  };

  const initializeBulletLocation = () => {
    BULLET_WIDTH_PX = minBullet.current.offsetWidth;
    SLIDER_WIDTH_PX = slider.current.offsetWidth - BULLET_WIDTH_PX;

    let tempMinPositionPX = (minValue * SLIDER_WIDTH_PX) / total;
    setMinBulletPositionPX(tempMinPositionPX);
    minBullet.current.style.left = `${tempMinPositionPX}px`;

    let tempMaxPositionPX = (maxValue * SLIDER_WIDTH_PX) / total;
    setMaxBulletPositionPX(tempMaxPositionPX);
    maxBullet.current.style.left = `${tempMaxPositionPX}px`;
  };

  const handleMouseMove = (event) => {
    const isMouseInsideSlider = slider.current.contains(event.target);
    if (isMouseInsideSlider && isDragging && selectedBullet) {
      var rect = slider.current.getBoundingClientRect();
      var relativeCursorPosition =
        event.clientX - rect.left - BULLET_WIDTH_PX / 2;

      let minClampedPosition, maxClampedPosition;

      if (selectedBullet.id === MIN_BULLET_ID) {
        minClampedPosition = 0;
        maxClampedPosition = maxBulletPositionPX - BULLET_WIDTH_PX;
      }
      if (selectedBullet.id === MAX_BULLET_ID) {
        minClampedPosition = minBulletPositionPX + BULLET_WIDTH_PX;
        maxClampedPosition = SLIDER_WIDTH_PX;
      }

      let clampedPositionPx = Math.min(
        Math.max(relativeCursorPosition, minClampedPosition),
        maxClampedPosition
      );

      let finalPosition;

      if (rangeValues) {
        finalPosition = getClosestNumber(
          rangeValuesLocations,
          clampedPositionPx
        );
      } else {
        let pixelStep = SLIDER_WIDTH_PX / total;
        finalPosition = Math.round(clampedPositionPx / pixelStep) * pixelStep;
      }

      selectedBullet.style.left = `${finalPosition}px`;
    }
  };

  const handleMouseUp = (event) => {
    setIsDragging(false);
    if (selectedBullet) {
      let rect = slider.current.getBoundingClientRect();
      let relativeCursorPosition = event.clientX - rect.left;

      let clampedPositionPx = Math.min(
        Math.max(relativeCursorPosition, 0),
        SLIDER_WIDTH_PX
      );

      let value = Math.round((total * clampedPositionPx) / SLIDER_WIDTH_PX);

      if (rangeValues) {
        value = getClosestNumber(rangeValues, value);
      }

      let returnObect = {
        min: minValue,
        max: maxValue,
      };

      if (selectedBullet.id === MIN_BULLET_ID) {
        setMinBulletPositionPX(relativeCursorPosition);
        setMinValue(value);
        returnObect.min = value;
      }
      if (selectedBullet.id === MAX_BULLET_ID) {
        setMaxBulletPositionPX(relativeCursorPosition);
        setMaxValue(value);
        returnObect.max = value;
      }

      console.log(returnObect);
      setSelectedBullet(null);
    }
  };

  const bulletSelect = (bullet) => {
    setIsDragging(true);
    setSelectedBullet(bullet.current);
  };

  const getClosestNumber = (numbersArray, number) => {
    if (numbersArray.length === 0) {
      return null;
    }

    const closest = numbersArray.reduce((a, b) =>
      Math.abs(b - number) < Math.abs(a - number) ? b : a
    );

    return closest;
  };

  return (
    <div className={styles.container}>
      <div className={styles.sliderContainer}>
        <div>Min: {minValue}</div>
        <div className={styles.rangeContainer} ref={slider}>
          <div className={styles.range} />
          <div
            className={`${styles.bullet} ${styles.minBullet} ${
              isDragging ? styles.isDragging : ""
            }`}
            onMouseDown={() => bulletSelect(minBullet)}
            ref={minBullet}
            id={MIN_BULLET_ID}
          />
          <div
            className={`${styles.bullet} ${styles.maxBullet}  ${
              isDragging ? styles.isDragging : ""
            }`}
            onMouseDown={() => bulletSelect(maxBullet)}
            ref={maxBullet}
            id={MAX_BULLET_ID}
          />
        </div>
        <div>Max: {maxValue}</div>
      </div>
    </div>
  );
}
