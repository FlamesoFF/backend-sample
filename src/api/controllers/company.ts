import { ICompany } from '../../@types/data/company';
import { CouchDbService } from '../../services/couchDb';
import { CompanyModel } from '../models/company';
import { Requests, Responses } from '../@types/api/controllers.types';
import { Utils } from '../shared/utils';
import { commonController } from './common';
import { MwAuth } from '../middlewares/auth';


export const companiesController = new class Controller {

    async create(request: Requests.Companies.ICreate) {
        const {
            _id,
            certificate,
            country,
            incorporated_on,
            name
        } = request.body;

        const company = CompanyModel.create({
            _id,
            certificate,
            country,
            incorporated_on,
            name
        });

        return await CouchDbService.adapter.insert(company);
    }

    async update(request: Requests.Companies.IUpdate) {
        const {
            body,
            params: { id }
        } = request;

        const { user } = MwAuth;


        if (!id) throw new Error('"id" is required!');


        const company = await CouchDbService.adapter.get(id) as ICompany;
        const updateData = CompanyModel.pickUpdateData(body);

        return await CouchDbService.adapter.insert(Object.assign(company, updateData));
    }

    async delete(request: Requests.Common.IRemove) {
        const { id } = request.params;

        const company = await CouchDbService.adapter.get(id);


        return await CouchDbService.adapter.destroy(id, company._rev);
    }

    /*
     * async createShareTransactions(companyId, sharePayload) {
     *  try {
     *      sharePayload.type = [sharePayload.type];
     *      sharePayload.class = 'shares';
     *
     *      const company: any = await couchDbAdapter.get(companyId);
     *
     *      sharePayload.relations = [{
     *          node: {
     *              id: company._id,
     *              name: company.name,
     *              class: 'company'
     *          },
     *          type: 'belong_to'
     *      }];
     *
     *      const result = await couchDbAdapter.insert(sharePayload);
     *      const members = sharePayload.transactions.filter(t => t.node.id !== companyId);
     *
     *
     *      for (const member of members) {
     *          const shareInfo = await Entity.getShares(member.node.id, { relatedTo: companyId });
     *
     *          const relation = {
     *              node: member.node,
     *              shares: shareInfo.total,
     *              share_type: 'ordinary',
     *              type: 'has_member'
     *          };
     *
     *          const relationIndex = company.relations.findIndex(r =>
     *              r.node.id ===
     *              relation.node.id &&
     *              r.type === relation.type &&
     *              r.node.class === relation.node.class
     *          );
     *
     *          if (!company.relations) {
     *              company.relations = [];
     *          }
     *
     *          if (relationIndex !== -1) {
     *              company.relations[relationIndex] = relation;
     *          } else {
     *              company.relations.push(relation);
     *          }
     *      }
     *
     *      await couchDbAdapter.insert(company, companyId);
     *      return result;
     *  } catch (error) {
     *      throw error;
     *  }
     * }
     */

    /**@description Search for company by its name */
    async search(request: Requests.Common.ISearch): Promise<Responses.Lists.Default> {
        const { name, type } = request.query;

        if (!name && !type) return await commonController.search(request, 'company', ['name']);

        else {
            const response = await commonController.fuzzySearch(request, 'company');

            return Utils.PostgreSQL.resultsToList(response);
        }

    }

    /**@description List first 1-100 companies */
    /*
     * async list(request: Requests.Common.ISearch): Promise<Responses.Lists.Default> {
     *     // return Utils.CouchDB.resultsToList(response, 'name');
     *     return response;
     * }
     */

};