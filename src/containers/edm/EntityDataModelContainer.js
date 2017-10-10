/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import SearchInput from '../../components/controls/SearchInput';
import * as Routes from '../../core/router/Routes';

import EntityTypesContainer from './entitytypes/EntityTypesContainer';
import PropertyTypesContainer from './propertytypes/PropertyTypesContainer';

import { fetchAllEntityTypesRequest } from './entitytypes/EntityTypesActionFactory';
import { fetchAllPropertyTypesRequest } from './propertytypes/PropertyTypesActionFactory';

const SUB_NAV_LINK_ACTIVE_CLASSNAME :string = 'sub-nav-link-active';

const EDMContainerWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

const EDMExplorerOuterWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  margin: 0;
  overflow-x: scroll;
  padding: 0;
`;

const EDMExplorerInnerWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 20px;
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

const ActionSection = styled.section`
  align-self: left;
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  margin: 20px 40px;
`;

const AddActionButton = StyledButton.extend`
  margin-left: 40px;
`;

type Props = {
  actions :{
    fetchAllEntityTypesRequest :Function,
    fetchAllPropertyTypesRequest :Function
  },
  location :{
    pathname :string
  }
}

type State = {
  searchQuery :string
};

class EntityDataModelContainer extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      searchQuery: ''
    };
  }

  componentDidMount() {

    this.props.actions.fetchAllEntityTypesRequest();
    this.props.actions.fetchAllPropertyTypesRequest();
  }

  handleSearchOnChange = (searchQuery :string) => {

    this.setState({ searchQuery });
  }

  renderNav = () => {

    return (
      <Nav>
        <NavTab to={Routes.PROPERTY_TYPES}>PropertyTypes</NavTab>
        <NavTab to={Routes.ENTITY_TYPES}>EntityTypes</NavTab>
        <NavTab to={Routes.ASSOCIATION_TYPES}>AssociationTypes</NavTab>
        <NavTab to={Routes.SCHEMAS}>Schemas</NavTab>
      </Nav>
    );
  }

  renderActionSection = () => {

    let buttonText :string = 'Add';

    switch (this.props.location.pathname) {
      case Routes.PROPERTY_TYPES:
        buttonText = `${buttonText} PropertyType`;
        break;
      case Routes.ENTITY_TYPES:
        buttonText = `${buttonText} EntityType`;
        break;
      case Routes.ASSOCIATION_TYPES:
        buttonText = `${buttonText} AssociationType`;
        break;
      case Routes.SCHEMAS:
        buttonText = `${buttonText} Schema`;
        break;
      default:
        break;
    }

    return (
      <ActionSection>
        <SearchInput onChange={this.handleSearchOnChange} />
        <AddActionButton disabled>{buttonText}</AddActionButton>
      </ActionSection>
    );
  }

  renderEntityTypesContainer = () => {

    return (
      <EntityTypesContainer filterQuery={this.state.searchQuery} />
    );
  }

  renderPropertyTypesContainer = () => {

    return (
      <PropertyTypesContainer filterQuery={this.state.searchQuery} />
    );
  }

  renderBodySection = () => {

    return (
      <Switch>
        <Route path={Routes.PROPERTY_TYPES} render={this.renderPropertyTypesContainer} />
        <Route path={Routes.ENTITY_TYPES} component={this.renderEntityTypesContainer} />
        <Route path={Routes.ASSOCIATION_TYPES} component={null} />
        <Route path={Routes.SCHEMAS} component={null} />
        <Redirect to={Routes.PROPERTY_TYPES} />
      </Switch>
    );
  }

  render() {

    return (
      <EDMContainerWrapper>
        { this.renderNav() }
        { this.renderActionSection() }
        <EDMExplorerOuterWrapper>
          <EDMExplorerInnerWrapper>
            { this.renderBodySection() }
          </EDMExplorerInnerWrapper>
        </EDMExplorerOuterWrapper>
      </EDMContainerWrapper>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
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
