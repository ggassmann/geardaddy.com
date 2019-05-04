import fetch from 'node-fetch';
import { getSolrAddress } from './solr';

export const cores = {
  getCoreStatus: async (coreName: string) => {
    const coreStatusResponse = await (
      await fetch(
        `${await getSolrAddress()}admin/cores?action=STATUS&core=${coreName}`
      )
    ).json();

    return coreStatusResponse.status[coreName];
  },
  createCore: async (coreName: string, instanceDir: string, config: string, schema: string, dataDir: string) => {
    const createCoreResponse = await (
      await fetch(
        `${await getSolrAddress()}admin/cores?action=CREATE&name=${coreName}&instanceDir=${instanceDir}&config=${config}&schema=${schema}&dataDir=${dataDir}`
      )
    ).json();
    return createCoreResponse;
  },
  reloadCore: async (coreName: string) => {
    const reloadCoreResponse = await (
      await fetch(
        `${await getSolrAddress()}admin/cores?action=RELOAD&core=${coreName}`
      )
    ).json();
    return reloadCoreResponse;
  }
}