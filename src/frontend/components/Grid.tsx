import styled from "styled-components";

export const Container = styled.div`
  width: 95%;
  margin: 0 2.5%;

  @media (min-width: 480px) {
    width: 440px;
    margin: auto;
  }

  @media (min-width: 760px) {
    width: 720px;
  }

  @media (min-width: 1040px) {
    width: 1000px;
  }

  @media (min-width: 1320px) {
    width: 1280px;
  }
`;