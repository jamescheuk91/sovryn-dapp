import { ApolloClient, InMemoryCache } from '@apollo/client';

import { useMemo } from 'react';

import { OrderOptions } from '@sovryn/ui';

import { graphZeroUrl } from '../../../../utils/constants';
import {
  CollSurplusChange_Filter,
  CollSurplusChange_OrderBy,
  useGetCollSurplusChangesQuery,
} from './../../../../utils/graphql/zero/generated';

const zeroClient = new ApolloClient({
  uri: graphZeroUrl,
  cache: new InMemoryCache({
    resultCaching: false,
  }),
});

export const useGetCollateralSurplusWithdrawals = (
  account: string,
  pageSize: number,
  page: number,
  orderOptions: OrderOptions,
) => {
  const config = useMemo(
    () => ({
      skip: page * pageSize,
      pageSize,
      orderBy: (orderOptions.orderBy as CollSurplusChange_OrderBy) || undefined,
      orderDirection: orderOptions.orderDirection || undefined,
      filters: {
        user_contains: account || '',
        collSurplusAfter: '0',
      } as CollSurplusChange_Filter,
    }),
    [page, orderOptions, pageSize, account],
  );

  const { loading, data } = useGetCollSurplusChangesQuery({
    variables: config,
    client: zeroClient,
  });

  const collSurplusChanges = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.collSurplusChanges.map(tx => ({
      id: tx.id,
      sequenceNumber: tx.sequenceNumber,
      collSurplusChange: tx.collSurplusChange,
      user: tx.user.id,
      timestamp: tx.transaction.timestamp,
      hash: tx.transaction.id,
    }));
  }, [data]);

  return { loading, data: collSurplusChanges };
};
