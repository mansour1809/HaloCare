import styled from "styled-components";

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h1`
  transform: rotate(2.4492937051703357e-16rad);
  color: rgba(50, 56, 66, 1);
  font-size: 20px;
  font-family:
    Archivo,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-weight: 700;
  text-align: right;
  align-self: center;
`;

const Dashboard = styled.div`
  border-radius: 6px;
  background-color: rgba(165, 225, 237, 1);
  align-self: flex-end;
  margin-top: 49px;
  width: 202px;
  max-width: 100%;
  padding: 9px 48px;
  overflow: hidden;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 14px;
  color: rgba(43, 76, 140, 1);
  font-weight: 700;
  white-space: nowrap;
  text-align: right;
  line-height: 2;
`;

export const SidebarHeader = () => {
  return (
    <Header>
      <Logo>HALO CARE</Logo>
      <Dashboard>דשבורד</Dashboard>
    </Header>
  );
};
