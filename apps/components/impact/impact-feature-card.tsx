import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import styled from 'styled-components/native';

const Card = styled(Box)<{ backgroundColor: string }>`
  background-color: ${(props) => props.backgroundColor};
  padding: 16px;
  border-radius: 12px;
  min-height: 150px;
  justify-content: center;
  margin-bottom: 8px;
`;

interface ImpactFeatureCardProps {
  title: string;
  stat?: string;
  bullets?: string[];
  backgroundColor: string;
}

const ImpactFeatureCard = ({ title, stat, bullets, backgroundColor }: ImpactFeatureCardProps) => {
  return (
    <Card backgroundColor={backgroundColor} onTouchEnd={() => console.log('Card tapped')}>
      <Text color="$white" fontSize="$md" fontWeight="bold">
        {title}
      </Text>
      {stat && (
        <Text color="$white" fontSize="$sm" mt={8}>
          {stat}
        </Text>
      )}
      {bullets && (
        <Box mt={8}>
          {bullets.map((bullet, index) => (
            <Text key={index} color="$white" fontSize="$sm" ml={8}>
              • {bullet}
            </Text>
          ))}
        </Box>
      )}
    </Card>
  );
};