import React from "react";
import { Box } from "../../src";
import styled from "styled-components";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  return (
    <div>
      <ScHeader>Box demo</ScHeader>
      <Box>test</Box>
    </div>
  );
};

export default Demo;

const ScHeader = styled.div`
  font-size: xx-large;
  color: gray;
`;
