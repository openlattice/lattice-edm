/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import AbstractTypes from '../../utils/AbstractTypes';
import * as Routes from '../../core/router/Routes';

import AbstractTypeOverviewContainer from './AbstractTypeOverviewContainer';

const {
  getAllAssociationTypes,
  getAllEntityTypes,
  getAllPropertyTypes
} = EntityDataModelApiActionFactory;

const SUB_NAV_LINK_ACTIVE_CLASSNAME :string = 'sub-nav-link-active';

/*
 * styled components
 */

const EDMContainerWrapper = styled.div`
  align-items: center;
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
  width: 100%;
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
    getAllPropertyTypes :Function;
    getAllEntityTypes :Function;
    getAllAssociationTypes :Function;
  };
};

class EntityDataModelContainer extends React.Component<Props> {

  componentDidMount() {

    this.props.actions.getAllPropertyTypes();
    this.props.actions.getAllEntityTypes();
    this.props.actions.getAllAssociationTypes();
  }

  renderAssociationTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.AssociationType} />
    );
  }

  renderEntityTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.EntityType} />
    );
  }

  renderPropertyTypesContainer = () => {

    return (
      <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.PropertyType} />
    );
  }

  render() {

    return (
      <EDMContainerWrapper>
        <Nav>
          <NavTab to={Routes.PROPERTY_TYPES}>PropertyTypes</NavTab>
          <NavTab to={Routes.ENTITY_TYPES}>EntityTypes</NavTab>
          <NavTab to={Routes.ASSOCIATION_TYPES}>AssociationTypes</NavTab>
        </Nav>
        <Switch>
          <Route path={Routes.PROPERTY_TYPES} render={this.renderPropertyTypesContainer} />
          <Route path={Routes.ENTITY_TYPES} render={this.renderEntityTypesContainer} />
          <Route path={Routes.ASSOCIATION_TYPES} render={this.renderAssociationTypesContainer} />
          <Redirect to={Routes.PROPERTY_TYPES} />
        </Switch>
      </EDMContainerWrapper>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    getAllAssociationTypes,
    getAllEntityTypes,
    getAllPropertyTypes
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default withRouter(
  connect(null, mapDispatchToProps)(EntityDataModelContainer)
);
