/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';

import { toggleOnline } from './AppActions';

const ToggleContainerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  margin-top: 40px;
  width: 100%;
`;

const OnlineIcon = styled.div`
  color: #47B881;
  font-size: 13px;
  &:hover {
    cursor: pointer;
  }
`;

const OfflineIcon = styled.div`
  color: #A6B1BB;
  font-size: 13px;
  &:hover {
    cursor: pointer;
  }
`;

const Text = styled.span`
  width: 80px;
`;

type Props = {
  isOnline :boolean;
  toggleOnline :() => void;
};

class OnlineToggleContainer extends Component<Props> {

  render() {
    const { props } = this;
    const { isOnline } = props;
    return (
      <ToggleContainerWrapper>
        {
          isOnline
            ? (
              <>
                <Text>ONLINE</Text>
                <OnlineIcon onClick={props.toggleOnline}>
                  <FontAwesomeIcon icon={faToggleOn} size="2x" />
                </OnlineIcon>
              </>
            )
            : (
              <>
                <Text>OFFLINE</Text>
                <OfflineIcon onClick={props.toggleOnline}>
                  <FontAwesomeIcon icon={faToggleOn} size="2x" rotation={180} />
                </OfflineIcon>
              </>
            )
        }
      </ToggleContainerWrapper>
    );
  }
}

const mapStateToProps = state => ({
  isOnline: state.getIn(['app', 'isOnline'], false),
});

export default connect(mapStateToProps, { toggleOnline })(OnlineToggleContainer);
