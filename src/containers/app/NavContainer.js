/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { AuthUtils } from 'lattice-auth';
import { NavLink } from 'react-router-dom';

import * as Routes from '../../core/router/Routes';

// injected by Webpack.DefinePlugin
declare var __ENV_DEV__ :boolean;

const NAV_LINK_ACTIVE_CLASSNAME :string = 'nav-link-active';

const Nav = styled.nav`
  background-color: #fefefe;
  border-bottom: 1px solid #c5d5e5;
  display: flex;
  flex: 0 0 auto;
  height: 50px;
  justify-content: center;
  width: 100%;
`;

const NavTab = styled(NavLink).attrs({
  activeClassName: NAV_LINK_ACTIVE_CLASSNAME
})`
  align-items: center;
  border-bottom: 1px solid transparent;
  color: #113355;
  display: flex;
  height: 100%;
  margin: 0 25px;
  text-align: center;
  text-decoration: none;
  &:hover {
   cursor: pointer;
  }
  &.${NAV_LINK_ACTIVE_CLASSNAME} {
    border-bottom: 1px solid #7a52ea;
    color: #7a52ea;
  }
`;

const NavContainer = () => {

  const showSync :boolean = AuthUtils.isAuthenticated() && AuthUtils.isAdmin() && __ENV_DEV__;
  const showGitHub :boolean = AuthUtils.isAuthenticated() && AuthUtils.isAdmin() && __ENV_DEV__;

  return (
    <Nav>
      <NavTab to={Routes.PROPERTY_TYPES}>
        PropertyTypes
      </NavTab>
      <NavTab to={Routes.ENTITY_TYPES}>
        EntityTypes
      </NavTab>
      <NavTab to={Routes.ASSOCIATION_TYPES}>
        AssociationTypes
      </NavTab>
      <NavTab to={Routes.SCHEMAS}>
        Schemas
      </NavTab>
      {
        showSync && (
          <NavTab to={Routes.SYNC}>
            Sync
          </NavTab>
        )
      }
      {
        showGitHub && (
          <NavTab to={Routes.GITHUB}>
            GitHub
          </NavTab>
        )
      }
    </Nav>
  );
};

export default NavContainer;
