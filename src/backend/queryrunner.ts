import { querydb } from "src/backend/db";
import { IQuery } from "src/data/IQuery";
import { ISolrItem } from "src/data/ISolrItem";
import { getSolrItemPage } from "src/backend/solr/solr";
import { ICalculatedItemLine } from "src/data/ICalculatedItemLine";
import { BuildCalculatedItemFromSolrItem, getBuild, PathOfBuildingItemBatcher } from "src/backend/pathofbuilding";
import { IDisplayedItem } from "src/data/IDisplayedItem";

let activeQueryIds = [];

export const startQueryRunner = async () => {
  const queryMap = (await querydb).get('queries').value() || {};
  const queryIds = Object.keys(queryMap)
  const queries: IQuery[] = queryIds.map((queryId) => queryMap[queryId]);
  activeQueryIds = queryIds;
  queries.forEach(async (query) => {
    const build = await getBuild(query.build || '');
    const solrItems: ISolrItem[] = await getSolrItemPage(query.id);
    const builtItems: ICalculatedItemLine[][] = await Promise.all(
      solrItems.map(
        async (solrItem) => await BuildCalculatedItemFromSolrItem(solrItem, build)
      )
    );
    await Promise.all(builtItems.map(async (_item, index) => {
      const newItem: IDisplayedItem = {
        id: solrItems[index].id,
        baseItem: solrItems[index],
        calculatedItem: builtItems[index],
        price: '',
        queryId: query.id,
      };
      await PathOfBuildingItemBatcher.add(newItem);
    }));
    console.log('finished item batch');
  })
}