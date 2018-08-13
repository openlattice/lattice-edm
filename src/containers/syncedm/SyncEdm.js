import React from 'react';
import Axios from 'axios';
import styled from 'styled-components';

const AUDIT_NAMESPACE = 'OPENLATTICE_AUDIT';

const StyledWrapper = styled.div`
  margin: 40px;
`;

const StyledInstructions = styled.div`
  margin-bottom: 4px;
`;

const StyledInputWrapper = styled.div`
  margin: 20px 0;
`;


export default class SyncEdm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      jwt: '',
      version: '',
      success: false,
      conflicts: null
    };
  }

  componentDidMount() {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.auth0_id_token}`
      }
    };
    Axios.get('http://localhost:8080/datastore/edm?fileType=json', config)
    .then((response) => {
      this.setState({ version: response.data.version });
    });
  }

  removeAudit = (edm) => {
    const propertyTypes = edm.propertyTypes.filter((propertyType) => {
      return propertyType.type.namespace !== AUDIT_NAMESPACE;
    });
    const entityTypes = edm.entityTypes.filter((enitityType) => {
      return enitityType.type.namespace !== AUDIT_NAMESPACE;
    });
    const associationTypes = edm.associationTypes.filter((associationType) => {
      return associationType.entityType.type.namespace !== AUDIT_NAMESPACE;
    });
    return Object.assign({}, edm, { propertyTypes, entityTypes, associationTypes });
  }

  importFn = () => {
    const prodConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.jwt}`
      }
    };
    const localConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.auth0_id_token}`
      }
    };
    Axios.get('https://api.openlattice.com/datastore/edm?fileType=json', prodConfig).then((edmResp) => {
      const edm = Object.assign({}, edmResp.data, { version: this.state.version });
      Axios.post('http://localhost:8080/datastore/edm/diff?fileType=json', this.removeAudit(edm), localConfig).then((diffResp) => {
        const conflicts = diffResp.data.conflicts;
        const diff = diffResp.data.diff;
        if (conflicts === null) {
          Axios.patch('http://localhost:8080/datastore/edm', diff, localConfig).then(() => {
            this.setState({
              conflicts,
              success: true
            });
          });
        }
        else {
          this.setState({
            success: false,
            conflicts
          });
        }
        this.setState({ success: true });
      });
    });
  }

  handleChange = (e) => {
    this.setState({ jwt: e.target.value });
  }

  showSuccess = () => {
    if (!this.state.success) return null;
    return <div style={{ color: 'green' }}>Success</div>;
  }

  showConflicts = () => {
    if (this.state.conflicts === null) return null;
    return (
      <div style={{ color: 'red' }}>
        <div>You have conflicts :(</div>
        <div>{this.state.conflicts}</div>
      </div>
    );
  }

  render() {
    return (
      <StyledWrapper>
        <StyledInstructions>Enter your jwt token here to import data model from prod.</StyledInstructions>
        <StyledInstructions><i>Only run this when your local databases have been wiped (cassandra, elasticsearch, postgres)</i></StyledInstructions>
        <StyledInputWrapper>
          <input type="text" name="jwt" onChange={this.handleChange} />
          <button onClick={this.importFn}>Import</button>
          {this.showSuccess()}
          {this.showConflicts()}
        </StyledInputWrapper>
      </StyledWrapper>
    );
  }
}
