/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import AbstractTypes from '../../utils/AbstractTypes';
import * as Routes from '../../core/router/Routes';

import AbstractTypeOverviewContainer from './AbstractTypeOverviewContainer';
import AssociationTypesContainer from './associationtypes/AssociationTypesContainer';

import { fetchAllAssociationTypesRequest } from './associationtypes/AssociationTypesActionFactory';
import { fetchAllEntityTypesRequest } from './entitytypes/EntityTypesActionFactory';
import { fetchAllPropertyTypesRequest } from './propertytypes/PropertyTypesActionFactory';

const SUB_NAV_LINK_ACTIVE_CLASSNAME :string = 'sub-nav-link-active';

/*
 * styled components
 */

const EDMContainerWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

const Nav = styled.nav`
  background-color: #fefefe;
  border-bottom: 1px solid #c5d5e5;
  display: flex;
  flex: 0 0 auto;
  height: 50px;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 0;
`;

const NavTab = styled(NavLink).attrs({
  activeClassName: SUB_NAV_LINK_ACTIVE_CLASSNAME
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
  &.${SUB_NAV_LINK_ACTIVE_CLASSNAME} {
    border-bottom: 1px solid #7a52ea;
    color: #7a52ea;
  }
`;

/*
 * types
 */

type Props = {
  actions :{
    fetchAllAssociationTypesRequest :Function,
    fetchAllEntityTypesRequest :Function,
    fetchAllPropertyTypesRequest :Function
  }
}

class EntityDataModelContainer extends React.Component<Props> {

  componentDidMount() {

    this.props.actions.fetchAllPropertyTypesRequest();
    this.props.actions.fetchAllEntityTypesRequest();
    this.props.actions.fetchAllAssociationTypesRequest();
  }

  renderAssociationTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer type={AbstractTypes.AssociationType} />
    );
  }

  renderEntityTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer type={AbstractTypes.EntityType} />
    );
  }

  renderPropertyTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer type={AbstractTypes.PropertyType} />
    );
  }

  renderSchemasContainer = () => {

    return (
      <p>TODO</p>
    );
  }

  render() {

    return (
      <EDMContainerWrapper>
        <Nav>
          <NavTab to={Routes.PROPERTY_TYPES}>PropertyTypes</NavTab>
          <NavTab to={Routes.ENTITY_TYPES}>EntityTypes</NavTab>
          <NavTab to={Routes.ASSOCIATION_TYPES}>AssociationTypes</NavTab>
          <NavTab to={Routes.SCHEMAS}>Schemas</NavTab>
        </Nav>
        <Switch>
          <Route path={Routes.PROPERTY_TYPES} render={this.renderPropertyTypesContainer} />
          <Route path={Routes.ENTITY_TYPES} render={this.renderEntityTypesContainer} />
          <Route path={Routes.ASSOCIATION_TYPES} render={this.renderAssociationTypesContainer} />
          <Route path={Routes.SCHEMAS} render={this.renderSchemasContainer} />
          <Redirect to={Routes.PROPERTY_TYPES} />
        </Switch>
      </EDMContainerWrapper>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    fetchAllAssociationTypesRequest,
    fetchAllEntityTypesRequest,
    fetchAllPropertyTypesRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default withRouter(
  connect(null, mapDispatchToProps)(EntityDataModelContainer)
);
