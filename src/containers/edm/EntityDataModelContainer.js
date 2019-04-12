/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';

import AbstractTypes from '../../utils/AbstractTypes';
import * as Routes from '../../core/router/Routes';

import AbstractTypeOverviewContainer from './AbstractTypeOverviewContainer';

const EDMContainerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

class EntityDataModelContainer extends React.Component<{}> {

  renderAssociationTypesContainer = () => (
    <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.AssociationType} />
  )

  renderEntityTypesContainer = () => (
    <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.EntityType} />
  )

  renderPropertyTypesContainer = () => (
    <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.PropertyType} />
  )

  renderSchemasContainer = () => (
    <AbstractTypeOverviewContainer workingAbstractTypeType={AbstractTypes.Schema} />
  )

  render() {

    return (
      <EDMContainerWrapper>
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

export default withRouter(EntityDataModelContainer);
