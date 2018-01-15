/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name shipment.shipmentDraftService
     *
     * @description
     * Service for communicating with the shipment draft endpoint of the OpenLMIS server.
     */
    angular
        .module('shipment')
        .service('shipmentDraftService', shipmentDraftService);

    shipmentDraftService.$inject = ['$resource', 'fulfillmentUrlFactory'];

    function shipmentDraftService($resource, fulfillmentUrlFactory) {
        var shipmentDraftService = this,
            resource = $resource(fulfillmentUrlFactory('/api/shipmentDrafts/:id'), {}, {
                update: {
                    method: 'PUT'
                }
            });

        shipmentDraftService.search = search;
        shipmentDraftService.save = save;
        shipmentDraftService.remove = remove;

        /**
         * @ngdoc method
         * @methodOf shipment.shipmentDraftService
         * @name search
         *
         * @description
         * Retrieves a list of shipments matching the given parameters.
         *
         * @param   {Object}    params  the list of parameters to send to the server
         * @return  {Promise}           the promise resolving to a page of shipment drafts
         */
        function search(params) {
            return resource.get(params).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf shipment.shipmentDraftService
         * @name save
         *
         * @description
         * Saves the given shipment on the server.
         *
         * @param  {Object}  shipment the shipment to be saved
         * @return {Promise}          the promise resolving to saved shipment
         */
        function save(shipment) {
            if (!shipment) {
                throw 'Shipment draft must be defined';
            }

            if (shipment.id) {
                return resource.update({
                    id: shipment.id
                }, shipment).$promise;
            }
            return resource.save(null, shipment).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf shipment.shipmentDraftService
         * @name remove
         *
         * @description
         * Removes the shipment draft with the given id.
         *
         * @param   {string}    id  the ID of the shipment
         * @return  {Promise}       the promise resolved when shipment was successfully removed or
         *                          rejected otherwise
         */
        function remove(id) {
            if (!id) {
                throw 'Shipment ID must be defined';
            }

            return resource.delete({
                id: id
            }).$promise;
        }
    }

})();
