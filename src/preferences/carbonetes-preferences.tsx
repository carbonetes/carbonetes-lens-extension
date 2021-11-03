import { Component } from "@k8slens/extensions";
import React from "react";
import { CarbonetesStore } from "./carbonetes-preference-store";
import request from '../service/requests';
import { observer } from "mobx-react";
import "./carbonetes-preferences.scss";

type Props = {
  carbonetesStore : CarbonetesStore
}

type State = {
  email           : string,
  password        : string,
  isSigningIn     : boolean,
  isSignInError   : boolean
}

@observer
export class CarbonetesPreferenceInput extends React.Component<Props, State> {
  constructor(props: { carbonetesStore: CarbonetesStore; } | Readonly<{ carbonetesStore: CarbonetesStore; }>) {
    super(props);
    this.state = {
      email         : '',
      password      : '',
      isSigningIn   : false,
      isSignInError : false
    };
  };

  onChange = (value: string, event : React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      [event.target.name]: value
    } as React.ComponentState);
  }

  signIn = () => {
    const { carbonetesStore } = this.props;
    const { email, password } = this.state;

    if (email === '' || password === '') {
      this.setState({
        isSignInError : true
      });

      return;
    }

    this.setState({
      isSigningIn : true
    }, () => {
      request.signIn({
        username  : email,
        password  : password
      }).then((response: any) => {
        const user = {
          auth    : response.data,
          email   : email,
          password: password,
        };

        carbonetesStore.signIn(user);

        request.getRegistries({
          headers: {
            'Authorization': `Bearer ${carbonetesStore.user.auth.token}`
          },
          params: {
            email
          }
        }).then(response => {
          carbonetesStore.registries = response.data;
        }).catch(error => {
          Component.Notifications.error(
            <div>{error.response.data}.</div>
          )
        });
      }).catch(error => {
        Component.Notifications.error(
          <div> Sorry, the credentials you entered is not valid.</div>
        )
      }).finally(() => {
        this.setState({
          isSigningIn : false
        });
      });
    });
  }

  signOut = () => {
    const { carbonetesStore } = this.props;

    carbonetesStore.signOut();
    this.setState({
      email: '',
      password: ''
    });
  }

  render() {
    const { carbonetesStore } = this.props
    const { email, isSignInError, isSigningIn, password } = this.state;

    return (
      <div className="flex column gaps">
        {
          carbonetesStore.enabled ? 
            <span>
              {`Currently signed in as ${carbonetesStore.user.email}`}
            </span>
          :
            <>
              <span>
                Sign in to enable comprehensive image analysis using Carbonetes.
              </span>
              <Component.Input
                dirty={isSignInError}
                name={'email'}
                onChange={this.onChange}
                placeholder={'Email'}
                theme={'round-black'}
                validators={[
                  Component.InputValidators.isRequired,
                  Component.InputValidators.isEmail
                ]}
                value={email}
                
              />
              <Component.Input
                dirty={isSignInError}
                name={'password'}
                onChange={this.onChange}
                placeholder={'Password'}
                theme={'round-black'}
                type={'password'}
                validators={[
                  Component.InputValidators.isRequired
                ]}
                value={password}
              />
            </>
        }
        <div className="flex column gaps align-flex-start">
          <Component.Button
            label='Sign In'
            onClick={this.signIn}
            primary
            waiting={isSigningIn}
            hidden={carbonetesStore.enabled}
          />
          <Component.Button
            label='Sign Out'
            primary
            onClick={this.signOut}
            hidden={!carbonetesStore.enabled}
          />
        </div>
        <span className="smallText">
          {
            !carbonetesStore.enabled &&
              <>Don't have an account? Click <a href="https://console.carbonetes.com/register/" target="_blank">here</a> to register.<br/></>
          }
          To know more about Carbonetes click here <a href="https://https://carbonetes.com/" target="_blank">here</a>.
        </span>
      </div>
    )
  }
}

export class CarbonetesPreferenceHint extends React.Component {
  render() {
    return (
      <span>
      </span>
    )
  }
}
