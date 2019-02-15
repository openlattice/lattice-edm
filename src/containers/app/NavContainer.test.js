/* eslint-disable no-underscore-dangle */

import 'jest-styled-components';

import React from 'react';
import LatticeAuth from 'lattice-auth';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import NavContainer from './NavContainer';

jest.mock('lattice-auth', () => ({
  AuthUtils: {
    isAdmin: jest.fn(),
    isAuthenticated: jest.fn(),
  }
}));

describe('NavContainer', () => {

  afterAll(() => {
    global.__ENV_DEV__ = false;
    global.__ENV_PROD__ = false;
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('snapshots', () => {

    describe('dev', () => {

      beforeAll(() => {
        global.__ENV_DEV__ = true;
        global.__ENV_PROD__ = false;
      });

      test('should match snapshot, admin and authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => true);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => true);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, admin but not authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => true);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => false);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, not admin but authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => false);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => true);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, not admin and not authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => false);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => true);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

    });

    describe('prod', () => {

      beforeAll(() => {
        global.__ENV_DEV__ = false;
        global.__ENV_PROD__ = true;
      });

      test('should match snapshot, admin and authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => true);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => true);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, admin but not authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => true);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => false);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, not admin but authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => false);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => true);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });

      test('should match snapshot, not admin and not authenticated', () => {

        LatticeAuth.AuthUtils.isAdmin = jest.fn().mockImplementation(() => false);
        LatticeAuth.AuthUtils.isAuthenticated = jest.fn().mockImplementation(() => false);

        const nav = shallow(
          <NavContainer />
        );
        expect(toJson(nav)).toMatchSnapshot();
      });
    });

  });

});
