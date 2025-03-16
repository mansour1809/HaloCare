/* eslint-disable react/prop-types */
import styled from "styled-components";

const NavItemContainer = styled.div`
  border-radius: 6px;
  background-color: ${(props) =>
    props.$active ? "rgba(236, 248, 250, 1)" : "rgba(255, 255, 255, 0)"};
  display: flex;
  width: 100%;
  padding: ${(props) => (props.$compact ? "8px 70px" : "9px 15px")};
  align-items: stretch;
  gap: 20px;
  overflow: hidden;
  justify-content: ${(props) => (props.$compact ? "center" : "space-between")};
  margin-top: ${(props) => props.$marginTop || "0"};
  white-space: nowrap;
  color: ${(props) =>
    props.$active ? "rgba(69, 183, 209, 1)" : "rgba(74, 85, 104, 1)"};
  font-weight: ${(props) => (props.$active ? "700" : "400")};
  font-size: ${(props) => (props.$compact ? "13px" : "14px")};
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${(props) => props.$gap || "12px"};
`;

const Icon = styled.img`
  aspect-ratio: ${(props) => props.$aspectRatio || "1"};
  object-fit: contain;
  object-position: center;
  width: ${(props) => props.$width || "12px"};
  margin: ${(props) => props.$margin || "auto 0"};
  flex-shrink: 0;
`;

export const NavigationItem = ({
  icon,
  secondaryIcon,
  label,
  active,
  compact,
  marginTop,
  iconWidth,
  iconMargin,
  gap,
  aspectRatio,
}) => {
  if (compact) {
    return (
      <NavItemContainer
        $active={active}
        $compact={compact}
        $marginTop={marginTop}
      >
        {label}
      </NavItemContainer>
    );
  }

  return (
    <NavItemContainer $marginTop={marginTop}>
      {icon && (
        <Icon src={icon} alt="" $width={iconWidth} $margin={iconMargin} />
      )}
      <ContentWrapper $gap={gap}>
        <span>{label}</span>
        {secondaryIcon && (
          <Icon
            src={secondaryIcon}
            alt=""
            $width={iconWidth}
            $aspectRatio={aspectRatio}
          />
        )}
      </ContentWrapper>
    </NavItemContainer>
  );
};
