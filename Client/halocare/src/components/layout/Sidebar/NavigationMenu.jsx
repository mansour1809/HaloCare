import styled from "styled-components";
import { NavigationItem } from "./NavigationItem";

const NavContainer = styled.nav`
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  margin-top: -13px;
  width: 100%;
  padding: 29px 22px 48px;
  flex-direction: column;
  align-items: flex-start;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 14px;
  color: rgba(74, 85, 104, 1);
  font-weight: 400;
  text-align: right;
  line-height: 2;
`;

export const NavigationMenu = () => {
  return (
    <NavContainer>
      <NavigationItem
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/69513e3918b8c71b42e1646c18af5efb5d75e1da4a781d75b12d0a600d8d497f?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        label="ניהול ילדים"
        secondaryIcon="https://cdn.builder.io/api/v1/image/assets/TEMP/4e46d032da651da7de003e66df55010169cc3aecdd5608a3508ef539856fd592?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        iconWidth="22px"
        gap="12px"
        aspectRatio="1.1"
      />

      <NavigationItem
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/69513e3918b8c71b42e1646c18af5efb5d75e1da4a781d75b12d0a600d8d497f?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        label="ניהול צוות"
        secondaryIcon="https://cdn.builder.io/api/v1/image/assets/TEMP/6f3a31726dc19952e8c36ec0733cd17ef0bf4083f20b88ebf8f4e5c863cc934a?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        marginTop="16px"
        iconWidth="21px"
        gap="14px"
        aspectRatio="1.1"
      />

      <NavigationItem
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/25d18ac11acd18b29299195dc5b3047bd06aaa61758a925dca4c986b37e3b9ea?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        label="יומן"
        secondaryIcon="https://cdn.builder.io/api/v1/image/assets/TEMP/68202d474fd3c2b74a91908af0890f7eae454cfc5d30cb48ba5b62922333e91d?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        marginTop="16px"
        iconWidth="24px"
        gap="8px"
      />

      <NavigationItem label="לוח שנה" active compact />

      <NavigationItem label="לוח פגישות" compact marginTop="7px" />

      <NavigationItem
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/69513e3918b8c71b42e1646c18af5efb5d75e1da4a781d75b12d0a600d8d497f?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        label="ניהול"
        secondaryIcon="https://cdn.builder.io/api/v1/image/assets/TEMP/8215132040022b6b6a1b26554db18a1532bbfd3eaa6c10300956a2bbf3ec2675?placeholderIfAbsent=true&apiKey=3caca7c2960f470e869c2eeb91e60c1b"
        marginTop="16px"
        iconWidth="17px"
        gap="11px"
      />
    </NavContainer>
  );
};
