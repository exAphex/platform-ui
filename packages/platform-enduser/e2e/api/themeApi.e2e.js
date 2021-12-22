/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
* Sets theme back to just Starter Theme
*/
// eslint-disable-next-line import/prefer-default-export
export function setBaseTheme(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/ui/themerealm`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json;charset=utf-8',
    },
    body: {
      _id: 'ui/themerealm',
      realm: {
        '/': [
          {
            accountCardBackgroundColor: '#ffffff',
            accountCardHeaderColor: '#23282e',
            accountCardInnerBorderColor: '#e7eef4',
            accountCardInputBackgroundColor: '#ffffff',
            accountCardInputBorderColor: '#c0c9d5',
            accountCardInputLabelColor: '#5e6d82',
            accountCardInputSelectColor: '#e4f4fd',
            accountCardInputTextColor: '#23282e',
            accountCardOuterBorderColor: '#e7eef4',
            accountCardShadow: 3,
            accountCardTabActiveColor: '#e4f4fd',
            accountCardTabActiveBorderColor: '#109cf1',
            accountCardTextColor: '#5e6d82',
            accountFooter: '',
            accountFooterEnabled: false,
            accountHeader: '',
            accountHeaderEnabled: false,
            accountNavigationBackgroundColor: '#ffffff',
            accountNavigationTextColor: '#455469',
            accountNavigationToggleBorderColor: '#e7eef4',
            accountPageSections: {
              personalInformation: { enabled: true },
              accountSecurity: {
                enabled: true,
                subsections: {
                  username: { enabled: true },
                  password: { enabled: true },
                  twoStepVerification: { enabled: true },
                  securityQuestions: { enabled: true },
                },
              },
              social: { enabled: false },
              trustedDevices: { enabled: true },
              oauthApplications: { enabled: false },
              preferences: { enabled: false },
              consent: { enabled: false },
              accountControls: { enabled: true },
            },
            accountTableRowHoverColor: '#f6f8fa',
            backgroundColor: '#f6f8fa',
            backgroundImage: '',
            buttonRounded: 5,
            fontFamily: 'Open Sans',
            journeyCardBackgroundColor: '#ffffff',
            journeyCardShadow: 3,
            journeyCardTextColor: '#5e6d82',
            journeyCardTitleColor: '#23282e',
            journeyInputBackgroundColor: '#ffffff',
            journeyInputBorderColor: '#c0c9d5',
            journeyInputLabelColor: '#5e6d82',
            journeyInputSelectColor: '#e4f4fd',
            journeyInputTextColor: '#23282e',
            linkActiveColor: '#0c85cf',
            linkColor: '#109cf1',
            logo: '',
            logoAltText: '',
            logoEnabled: true,
            logoHeight: '40',
            logoProfile: 'test',
            logoProfileAltText: 'test',
            logoProfileCollapsed: 'test',
            logoProfileCollapsedAltText: 'test',
            logoProfileHeight: '40',
            primaryColor: '#109cf1',
            primaryOffColor: '#0c85cf',
            profileBackgroundColor: '#ffffff',
            profileFooter: '',
            profileFooterEnabled: false,
            profileMenuHighlightColor: '#e4f4fd',
            profileMenuTextHighlightColor: '#455469',
            profileMenuHoverColor: '#109cf1',
            profileMenuHoverTextColor: '#ffffff',
            name: 'Starter Theme',
            isDefault: true,
            switchBackgroundColor: '#c0c9d5',
            textColor: '#ffffff',
            topBarBackgroundColor: '#ffffff',
            topBarBorderColor: '#e7eef4',
            topBarHeaderColor: '#23282e',
            topBarTextColor: '#69788b',
          },
        ],
        alpha: [
          {
            accountCardBackgroundColor: '#ffffff',
            accountCardHeaderColor: '#23282e',
            accountCardInnerBorderColor: '#e7eef4',
            accountCardInputBackgroundColor: '#ffffff',
            accountCardInputBorderColor: '#c0c9d5',
            accountCardInputLabelColor: '#5e6d82',
            accountCardInputSelectColor: '#e4f4fd',
            accountCardInputTextColor: '#23282e',
            accountCardOuterBorderColor: '#e7eef4',
            accountCardShadow: 3,
            accountCardTabActiveColor: '#e4f4fd',
            accountCardTabActiveBorderColor: '#109cf1',
            accountCardTextColor: '#5e6d82',
            accountFooter: '',
            accountFooterEnabled: false,
            accountHeader: '',
            accountHeaderEnabled: false,
            accountNavigationBackgroundColor: '#ffffff',
            accountNavigationTextColor: '#455469',
            accountNavigationToggleBorderColor: '#e7eef4',
            accountPageSections: {
              personalInformation: { enabled: true },
              accountSecurity: {
                enabled: true,
                subsections: {
                  username: { enabled: true },
                  password: { enabled: true },
                  twoStepVerification: { enabled: true },
                  securityQuestions: { enabled: true },
                },
              },
              social: { enabled: false },
              trustedDevices: { enabled: true },
              oauthApplications: { enabled: false },
              preferences: { enabled: false },
              consent: { enabled: false },
              accountControls: { enabled: true },
            },
            accountTableRowHoverColor: '#f6f8fa',
            backgroundColor: '#f6f8fa',
            backgroundImage: '',
            buttonRounded: 5,
            fontFamily: 'Open Sans',
            journeyCardBackgroundColor: '#ffffff',
            journeyCardShadow: 3,
            journeyCardTextColor: '#5e6d82',
            journeyCardTitleColor: '#23282e',
            journeyInputBackgroundColor: '#ffffff',
            journeyInputBorderColor: '#c0c9d5',
            journeyInputLabelColor: '#5e6d82',
            journeyInputSelectColor: '#e4f4fd',
            journeyInputTextColor: '#23282e',
            linkActiveColor: '#0c85cf',
            linkColor: '#109cf1',
            logo: '',
            logoAltText: '',
            logoEnabled: true,
            logoHeight: '40',
            logoProfile: 'test',
            logoProfileAltText: 'test',
            logoProfileCollapsed: 'test',
            logoProfileCollapsedAltText: 'test',
            logoProfileHeight: '40',
            primaryColor: '#109cf1',
            primaryOffColor: '#0c85cf',
            profileBackgroundColor: '#ffffff',
            profileFooter: '',
            profileFooterEnabled: false,
            profileMenuHighlightColor: '#e4f4fd',
            profileMenuTextHighlightColor: '#455469',
            profileMenuHoverColor: '#109cf1',
            profileMenuHoverTextColor: '#ffffff',
            name: 'Starter Theme',
            isDefault: true,
            switchBackgroundColor: '#c0c9d5',
            textColor: '#ffffff',
            topBarBackgroundColor: '#ffffff',
            topBarBorderColor: '#e7eef4',
            topBarHeaderColor: '#23282e',
            topBarTextColor: '#69788b',
          },
        ],
      },
    },
  });
}
