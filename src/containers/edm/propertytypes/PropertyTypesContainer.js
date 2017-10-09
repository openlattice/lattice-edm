/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AbstractDataTable from '../../../components/datatable/AbstractDataTable';
import StyledFlexComponent from '../../../components/flex/StyledFlexComponent';

import {
  StyledCard,
  StyledCardSection,
  StyledCardSectionBody,
  StyledCardSectionTitle,
  StyledCardTitle
} from '../../../components/cards/StyledCard';

import { fetchAllPropertyTypesRequest } from './PropertyTypesActionFactory';

const { FullyQualifiedName } = Models;

const Wrapper = StyledFlexComponent.extend`
  align-items: flex-start;
  justify-content: space-evenly;
`;

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    fetchAllPropertyTypesRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

type Props = {
  actions :{
    fetchAllPropertyTypesRequest :Function
  },
  propertyTypes :List<Map<*, *>>
};

type State = {
  selectedPropertyTypeIndex :number
};

class PropertyTypesContainer extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      selectedPropertyTypeIndex: 0
    };
  }

  componentDidMount() {

    this.props.actions.fetchAllPropertyTypesRequest();
  }

  renderAbstractTypeTable() {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = this.props.propertyTypes.map((propertyType :Map<*, *>) => {
      // TODO: make this better
      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
        const ptFQN :FullyQualifiedName = new FullyQualifiedName(ptType.toJS());
        map.set('type', ptFQN.getFullyQualifiedName());
        map.set('title', propertyType.get('title', ''));
      });
    });

    const onClick :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedPropertyTypeIndex: selectedRowIndex
      });
    };

    return (
      <AbstractDataTable
          data={data}
          headers={Immutable.fromJS(headers)}
          onRowClick={onClick}
          maxHeight={600}
          maxWidth={800} />
    );
  }

  renderPropertyTypeTable = () => {

    return (
      <StyledCard>
        <StyledCardTitle>EDM PropertyTypes</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionBody>
            { this.renderAbstractTypeTable() }
          </StyledCardSectionBody>
        </StyledCardSection>
      </StyledCard>
    );
  }

  renderPropertyTypeDetails = () => {

    if (this.state.selectedPropertyTypeIndex < 0) {
      return null;
    }

    const propertyType :Map<*, *> = this.props.propertyTypes.get(this.state.selectedPropertyTypeIndex);

    const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
    const fqnAsString :string = `${new FullyQualifiedName(ptType.toJS())}`;

    const ptSchemas :List<*> = propertyType.get('schemas', Immutable.List());
    const schemasAsString :string = ptSchemas.isEmpty() ? '[]' : ptSchemas.toString();

    const ptPII :boolean = propertyType.get('piiField', false);
    const piiAsString :string = `${ptPII}`;

    return (
      <StyledCard style={{ minWidth: '500px', maxWidth: '500px' }}>
        <StyledCardTitle>PropertyType Details</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionTitle>ID</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('id') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Type</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ fqnAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Title</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('title') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Description</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('description') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>DataType</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('datatype') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Schemas</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ schemasAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>PII</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ piiAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Analyzer</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('analyzer') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
      </StyledCard>
    );
  }

  render() {

    if (this.props.propertyTypes.isEmpty()) {
      return null;
    }

    return (
      <Wrapper>
        { this.renderPropertyTypeTable() }
        { this.renderPropertyTypeDetails() }
      </Wrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyTypesContainer);
