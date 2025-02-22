/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import { removeEsvSubScopes, buildScopes, getPublicKey } from './serviceAccountUtils';

describe('serviceAccountUtils', () => {
  describe('removeEsvSubScopes', () => {
    describe('given all sub scopes', () => {
      it('should remove sub scopes', () => {
        const subScopes = [
          'fr:idm:*',
          'fr:idc:esv:read',
          'fr:idc:esv:update',
          'fr:idc:esv:restart',
          'fr:am:*',
        ];

        const filteredList = removeEsvSubScopes(subScopes);
        expect(filteredList.includes('fr:idm:*')).toBeTruthy();
        expect(filteredList.includes('fr:am:*')).toBeTruthy();
      });
    });

    describe('should throw error', () => {
      it.each`
      name                    | invalidScope
      ${'given false'}        | ${false}
      ${'given zero'}         | ${0}
      ${'given empty string'} | ${''}
      ${'given null'}         | ${null}
      ${'given undefined'}    | ${undefined}
      ${'given NaN'}          | ${NaN}
      `('$name', ({ invalidScope }) => {
        expect(() => removeEsvSubScopes(invalidScope)).toThrowError('Something went wrong. No scopes found.');
      });

      it.each`
      name                   | invalidScope
      ${'when empty array'}  | ${[]}
      ${'when empty object'} | ${{}}
      ${'when string'}       | ${'string'}
      ${'when number'}       | ${42}
      `('$name', ({ invalidScope }) => {
        expect(() => removeEsvSubScopes(invalidScope)).toThrowError('Something went wrong, pleaser provide valid list of scopes.');
      });
    });
  });

  describe('buildScopes', () => {
    describe('should build scopes', () => {
      it.each`
      name                                                                                     | validScope                                                                        | expected
      ${'when empty scopes provided, should remove empty scopes'}                              | ${['fr:idm:*', '', '', 'fr:am:*']}                                                | ${['fr:idm:*', 'fr:am:*']}
      ${'when fr:idc:esv:* selected, should remove esv:read/esv:update/esv:restart'}           | ${['fr:idc:esv:*', 'fr:idc:esv:read', 'fr:idc:esv:update', 'fr:idc:esv:restart']} | ${['fr:idc:esv:*']}
      ${'when esv:read/esv:update/esv:restart all selected, should replace with fr:idc:esv:*'} | ${['fr:idc:esv:read', 'fr:idc:esv:update', 'fr:idc:esv:restart']}                 | ${['fr:idc:esv:*']}
      `('$name', ({ validScope, expected }) => {
        const scopes = buildScopes(validScope);
        expect(scopes).toEqual(expected);
      });
    });

    describe('should throw error', () => {
      describe('when invalid scopes', () => {
        it.each`
        name                    | invalidScope
        ${'given false'}        | ${false}
        ${'given zero'}         | ${0}
        ${'given empty string'} | ${''}
        ${'given null'}         | ${null}
        ${'given undefined'}    | ${undefined}
        ${'given NaN'}          | ${NaN}
        `('$name', ({ invalidScope }) => {
          expect(() => buildScopes(invalidScope)).toThrowError('Something went wrong. No scopes found.');
        });

        it.each`
        name                   | invalidScope
        ${'when empty array'}  | ${[]}
        ${'when empty object'} | ${{}}
        ${'when string'}       | ${'string'}
        ${'when number'}       | ${42}
        `('$name', ({ invalidScope }) => {
          expect(() => buildScopes(invalidScope)).toThrowError('Something went wrong, pleaser provide valid list of scopes.');
        });
      });
    });
  });

  describe('getPublicKey', () => {
    describe('should return public key', () => {
      describe('given valid jwks', () => {
        it.each`
        name                        | validJwks | expected
        ${'given stub-publickey'}   | ${'{"e":"AQAB","kty":"RSA","n":"stub-publickey"}'}   | ${'stub-publickey'}
        ${'given stub-publickey-2'} | ${'{"e":"AQAB","kty":"RSA","n":"stub-publickey-2"}'} | ${'stub-publickey-2'}
        ${'given stub-publickey-3'} | ${'{"e":"AQAB","kty":"RSA","n":"stub-publickey-3"}'} | ${'stub-publickey-3'}
        `('$name', ({ validJwks, expected }) => {
          const publicKey = getPublicKey(validJwks);
          expect(publicKey).toBe(expected);
        });
      });
    });

    describe('should throw error', () => {
      describe('when invalid jwks', () => {
        it.each`
        name                    | invalidJwks
        ${'given false'}        | ${false}
        ${'given zero'}         | ${0}
        ${'given empty string'} | ${''}
        ${'given null'}         | ${null}
        ${'given undefined'}    | ${undefined}
        ${'given NaN'}          | ${NaN}
        `('$name', ({ invalidJwks }) => {
          expect(() => getPublicKey(invalidJwks)).toThrowError('Please provide a valid json web key set');
        });

        it('given unparsable string', () => {
          expect(() => getPublicKey('standard string')).toThrowError('Please provide a valid parsable string');
        });

        it('given parsable strings that do not contain an `n` field', () => {
          expect(() => getPublicKey('{"e":"AQAB","kty":"RSA","m":"stub-new-jwks"}')).toThrowError('No public key found for given JSON');
        });
      });
    });
  });
});
