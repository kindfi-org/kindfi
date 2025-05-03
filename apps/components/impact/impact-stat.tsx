import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import styled from 'styled-components/native';

const StatCard = styled(Box)<{ backgroundColor: string }>`
  background-color: ${(props) => props.backgroundColor};
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

interface ImpactStatProps {
  label: string;
  backgroundColor: string;
}

const ImpactStat = ({ label, backgroundColor }: ImpactStatProps) => {
  return (
    <StatCard backgroundColor={backgroundColor} onTouchEnd={() => console.log('Stat tapped')}>
      <Text color="$white" fontSize="$lg" fontWeight="bold" textAlign="center">
        {label}
      </Text>
    </StatCard>
  );
};