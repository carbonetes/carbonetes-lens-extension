import { Renderer } from "@k8slens/extensions";
import React from "react";
import { CarbonetesStore } from "./carbonetes-preference-store";
import request from '../service/requests';
import { observer } from "mobx-react";
import "./carbonetes-preferences.scss";

const { Component } = Renderer;

type Props = {}

type State = {
  email           : string,
  password        : string,
  isSigningIn     : boolean,
  isSignInError   : boolean
}

@observer
export class CarbonetesPreferenceInput extends React.Component<Props, State> {
  constructor(props: { } | Readonly<{ }>) {
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

        CarbonetesStore.getInstance().enabled = true;
        CarbonetesStore.getInstance().user = user;

        request.getRegistries({
          headers: {
            'Authorization': `Bearer ${CarbonetesStore.getInstance().user.auth.token}`
          },
          params: {
            email
          }
        }).then(response => {
          CarbonetesStore.getInstance().registries = response.data;
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
    CarbonetesStore.getInstance().enabled = false;
    CarbonetesStore.getInstance().user = {
      email: '',
      password: '',
      auth: {
        username: '',
        token: ''
      }
    }
    CarbonetesStore.getInstance().analysis = {
      deployment: {},
      result: {},
      isAnalyzing: false,
      isAnalyzed: false,
    };
    CarbonetesStore.getInstance().analyses = [];
    CarbonetesStore.getInstance().registries = [];
    
    this.setState({
      email: '',
      password: ''
    });
  }

  render() {
    const { email, isSignInError, isSigningIn, password } = this.state;

    return (
      <div className="flex column gaps">
        {
          CarbonetesStore.getInstance().enabled ? 
            <span>
              {`Currently signed in as ${!CarbonetesStore.getInstance().user?this.state.email:CarbonetesStore.getInstance().user.email}`}
              {/* {`Currently signed in as ${displayEmail}`}   */}
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
            hidden={CarbonetesStore.getInstance().enabled}
          />
          <Component.Button
            label='Sign Out'
            primary
            onClick={this.signOut}
            hidden={!CarbonetesStore.getInstance().enabled}
          />
        </div>
        <span className="smallText">
          {
            !CarbonetesStore.getInstance().enabled &&
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
