import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { transformPoint, isPointConfident } from '../../domain/poseMath';
import { SKELETON_CONNECTIONS } from './PoseDetectionService';

/**
 * SkeletonOverlay
 *
 * High-performance vector skeleton overlay rendered on top of the camera preview.
 * Converts normalized [0, 1] landmark coordinates to viewport dimensions and handles
 * front-camera mirroring.
 */
export const SkeletonOverlay = React.memo(({
  landmarks,
  width,
  height,
  isMirrored = false,
  isAligned = true,
  isDown = false,
  visible = true,
}) => {
  if (!visible || !landmarks || !width || !height || landmarks.length === 0) {
    return null;
  }

  // Choose accent color based on exercise state & alignment
  let boneColor = '#3B82F6'; // Default Navy-cyan
  let jointColor = '#60A5FA';

  if (!isAligned) {
    boneColor = '#F59E0B'; // Amber warning for misalignment
    jointColor = '#FBBF24';
  } else if (isDown) {
    boneColor = '#10B981'; // Green for good depth
    jointColor = '#34D399';
  }

  // Pre-transform all landmarks to screen coordinates
  const transformedPoints = landmarks.map((pt) => {
    if (!pt) return null;
    return transformPoint(pt, width, height, isMirrored);
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {/* Skeletal connection lines */}
        {SKELETON_CONNECTIONS.map(([startIdx, endIdx], idx) => {
          const startPt = transformedPoints[startIdx];
          const endPt = transformedPoints[endIdx];

          if (!startPt || !endPt || !startPt.confident || !endPt.confident) {
            return null;
          }

          return (
            <Line
              key={`bone-${idx}`}
              x1={startPt.x}
              y1={startPt.y}
              x2={endPt.x}
              y2={endPt.y}
              stroke={boneColor}
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.88}
            />
          );
        })}

        {/* Joint circles */}
        {transformedPoints.map((pt, idx) => {
          if (!pt || !pt.confident) return null;

          // Emphasize key tracking joints (shoulders 11, 12, elbows 13, 14, wrists 15, 16)
          const isKeyJoint = [11, 12, 13, 14, 15, 16, 23, 24, 27, 28].includes(idx);
          const radius = isKeyJoint ? 6 : 4;

          return (
            <React.Fragment key={`joint-${idx}`}>
              {/* Outer soft glow ring */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={radius + 3}
                fill={jointColor}
                opacity={0.35}
              />
              {/* Inner crisp node */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={radius}
                fill="#FFFFFF"
                stroke={jointColor}
                strokeWidth="2"
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
});
