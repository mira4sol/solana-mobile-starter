import React, { useCallback, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';

import {
  getUserEmbeddedSolanaWallet,
  PrivyEmbeddedSolanaWalletProvider,
  useEmbeddedSolanaWallet,
  useLinkWithOAuth,
  usePrivy,
} from '@privy-io/expo';
import { useLinkWithPasskey } from '@privy-io/expo/passkey';
import { PrivyUser } from '@privy-io/public-api';
import Constants from 'expo-constants';

const toMainIdentifier = (x: PrivyUser['linked_accounts'][number]) => {
  if (x.type === 'phone') {
    return x.phoneNumber;
  }
  if (x.type === 'email' || x.type === 'wallet') {
    return x.address;
  }

  if (x.type === 'twitter_oauth' || x.type === 'tiktok_oauth') {
    return x.username;
  }

  if (x.type === 'custom_auth') {
    return x.custom_user_id;
  }

  return x.type;
};

export const UserScreen = () => {
  const [chainId, setChainId] = useState('1');
  const [signedMessages, setSignedMessages] = useState<string[]>([]);

  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { wallets, create } = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);

  const signMessage = useCallback(
    async (provider: PrivyEmbeddedSolanaWalletProvider) => {
      try {
        const { signature } = await provider.request({
          method: 'signMessage',
          params: {
            message: 'From Solana Mobile',
          },
        });
        if (signature) {
          setSignedMessages((prev) => prev.concat(signature));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  const switchChain = useCallback(
    async (provider: PrivyEmbeddedSolanaWalletProvider, id: string) => {
      try {
        // TODO: Implement switch chain
        // await provider.request
        alert(`Chain switched to ${id} successfully`);
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  if (!user) {
    return null;
  }

  return (
    <View>
      <Button
        title="Link Passkey"
        onPress={() =>
          linkWithPasskey({
            relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
          })
        }
      />
      <View style={{ display: 'flex', flexDirection: 'column', margin: 10 }}>
        {(['github', 'google', 'discord', 'apple'] as const).map((provider) => (
          <View key={provider}>
            <Button
              title={`Link ${provider}`}
              disabled={oauth.state.status === 'loading'}
              onPress={() => oauth.link({ provider })}
            ></Button>
          </View>
        ))}
      </View>

      <ScrollView style={{ borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1 }}>
        <View
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <View>
            <Text style={{ fontWeight: 'bold' }}>User ID</Text>
            <Text>{user.id}</Text>
          </View>

          <View>
            <Text style={{ fontWeight: 'bold' }}>Linked accounts</Text>
            {user?.linked_accounts.length ? (
              <View style={{ display: 'flex', flexDirection: 'column' }}>
                {user?.linked_accounts?.map((m) => (
                  <Text
                    key={m.verified_at}
                    style={{
                      color: 'rgba(0,0,0,0.5)',
                      fontSize: 12,
                      fontStyle: 'italic',
                    }}
                  >
                    {m.type}: {toMainIdentifier(m)}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <View>
            {account?.address && (
              <>
                <Text style={{ fontWeight: 'bold' }}>Embedded Wallet</Text>
                <Text>{account?.address}</Text>
              </>
            )}

            <Button title="Create Wallet" onPress={() => create?.()} />

            <>
              <Text>Chain ID to set to:</Text>
              <TextInput
                value={chainId}
                onChangeText={setChainId}
                placeholder="Chain Id"
              />
              <Button
                title="Switch Chain"
                disabled={!wallets?.[0]}
                onPress={async () =>
                  switchChain(await wallets?.[0].getProvider()!, chainId)
                }
              />
            </>
          </View>

          <View style={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              title="Sign Message"
              disabled={!wallets?.[0]}
              onPress={async () =>
                signMessage(await wallets?.[0].getProvider()!)
              }
            />

            <Text>Messages signed:</Text>
            {signedMessages.map((m) => (
              <React.Fragment key={m}>
                <Text
                  style={{
                    color: 'rgba(0,0,0,0.5)',
                    fontSize: 12,
                    fontStyle: 'italic',
                  }}
                >
                  {m}
                </Text>
                <View
                  style={{
                    marginVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(0,0,0,0.2)',
                  }}
                />
              </React.Fragment>
            ))}
          </View>
          <Button title="Logout" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
};
