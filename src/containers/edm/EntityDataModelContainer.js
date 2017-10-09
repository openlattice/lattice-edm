/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { NavLink, Redirect, Route, Switch, withRouter } from 'react-router-dom';

import StyledButton from '../../components/buttons/StyledButton';
import SearchInput from '../../components/controls/SearchInput';
import StyledFlexComponentCentered from '../../components/flex/StyledFlexComponentCentered';
import StyledFlexComponentStacked from '../../components/flex/StyledFlexComponentStacked';
import * as Routes from '../../core/router/Routes';

import PropertyTypesContainer from './propertytypes/PropertyTypesContainer';

const SUB_NAV_LINK_ACTIVE_CLASSNAME :string = 'sub-nav-link-active';

const StyledFlexNavComponent = StyledFlexComponentCentered.withComponent('nav');
const StyledFlexSectionComponent = StyledFlexComponentCentered.withComponent('section');

const Wrapper = StyledFlexComponentStacked.extend`
  flex: 1 0 auto;
`;

const Section = StyledFlexSectionComponent.extend`
  justify-content: center;
  margin: 20px 0;
`;

const NavSection = Section.extend`
  margin-bottom: 20px;
  margin-top: 0;
`;

const Nav = StyledFlexNavComponent.extend`
  background-color: #fefefe;
  border-bottom: 1px solid #c5d5e5;
  flex: 1 0 auto;
  height: 50px;
  justify-content: center;
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

const ActionSection = Section.extend`
  align-self: center;
  justify-content: space-between;
`;

type Props = {
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

  handleSearchOnChange = (searchQuery :string) => {

    this.setState({ searchQuery });
  }

  renderNavSection = () => {

    return (
      <NavSection>
        <Nav>
          <NavTab to={Routes.PROPERTY_TYPES}>PropertyTypes</NavTab>
          <NavTab to={Routes.ENTITY_TYPES}>EntityTypes</NavTab>
          <NavTab to={Routes.ASSOCIATION_TYPES}>AssociationTypes</NavTab>
          <NavTab to={Routes.SCHEMAS}>Schemas</NavTab>
        </Nav>
      </NavSection>
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
        <StyledButton disabled>{buttonText}</StyledButton>
      </ActionSection>
    );
  }

  renderPropertyTypesContainer = () => {

    return (
      <PropertyTypesContainer filterQuery={this.state.searchQuery} />
    );
  }

  renderBodySection = () => {

    return (
      <Section>
        <Switch>
          <Route path={Routes.PROPERTY_TYPES} render={this.renderPropertyTypesContainer} />
          <Route path={Routes.ENTITY_TYPES} component={null} />
          <Route path={Routes.ASSOCIATION_TYPES} component={null} />
          <Route path={Routes.SCHEMAS} component={null} />
          <Redirect to={Routes.PROPERTY_TYPES} />
        </Switch>
      </Section>
    );
  }

  render() {

    return (
      <Wrapper>
        { this.renderNavSection() }
        { this.renderActionSection() }
        { this.renderBodySection() }
      </Wrapper>
    );
  }
}

export default withRouter(EntityDataModelContainer);
