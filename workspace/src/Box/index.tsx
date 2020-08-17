import React from "react";
import styled from "styled-components";

interface IProps {}

export const Box: React.FC<IProps> = ({ children }) => {
  return <ScBox>{children}</ScBox>;
};

const ScBox = styled.div`
  border: 1px solid red;
  color: blue;
`;
