import { router } from 'expo-router';
import TokenSearch, { TokenItem } from '@/components/TokenSearch';

export default function SearchScreen() {
  const handleSelectToken = (token: TokenItem) => {
    router.push({
      pathname: '/(modals)/token-detail',
      params: { tokenAddress: token.address },
    });
  };

  return (
    <TokenSearch
      mode="fullscreen"
      onSelectToken={handleSelectToken}
      title="Search Tokens"
      showBalances={false}
      useRouterBack={true}
    />
  );
}
