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
     * @name transfer.transferService
     *
     * @description
     * Communicates with the transfer endpoints of the fulfillment service.
     */
    angular
        .module('transfer')
        .service('transferService', service);

    service.$inject = ['$resource', 'fulfillmentUrlFactory'];

    function service($resource, fulfillmentUrlFactory) {
        var resource = $resource(fulfillmentUrlFactory('/api/transfers/requests/:id'), {}, {
            getPartners: {
                method: 'GET',
                url: fulfillmentUrlFactory('/api/transfers/partners'),
                isArray: true
            },
            createRequest: {
                method: 'POST',
                url: fulfillmentUrlFactory('/api/transfers/requests')
            },
            updateRequest: {
                method: 'PUT'
            },
            sendRequest: {
                method: 'PUT',
                url: fulfillmentUrlFactory('/api/transfers/requests/:id/send')
            }
        });

        this.getPartners = getPartners;
        this.createRequest = createRequest;
        this.updateRequest = updateRequest;
        this.sendRequest = sendRequest;

        /**
         * @ngdoc method
         * @methodOf transfer.transferService
         * @name getPartners
         *
         * @description
         * Gets the facilities the given facility may transfer stock with. An empty list is a valid answer.
         *
         * @param  {String}  facilityId the facility the transfer starts from
         * @param  {String}  programId  the program of the transfer
         * @param  {String}  direction  SEND for facilities it may send to, REQUEST for facilities it may request from
         * @return {Promise}            the list of partner facilities
         */
        function getPartners(facilityId, programId, direction) {
            return resource.getPartners({
                facilityId: facilityId,
                programId: programId,
                direction: direction
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf transfer.transferService
         * @name createRequest
         *
         * @description
         * Creates a transfer request in the CREATING status.
         *
         * @param  {Object}  order the program, requesting and supplying facility of the request
         * @return {Promise}       the created order
         */
        function createRequest(order) {
            return resource.createRequest({}, order).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf transfer.transferService
         * @name updateRequest
         *
         * @description
         * Saves the line items of a transfer request. Quantities are in doses.
         *
         * @param  {Object}  order the full order, as returned by the orders endpoint
         * @return {Promise}       the updated order
         */
        function updateRequest(order) {
            return resource.updateRequest({
                id: order.id
            }, order).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf transfer.transferService
         * @name sendRequest
         *
         * @description
         * Saves and sends a transfer request to the supplying facility.
         *
         * @param  {Object}  order the full order, as returned by the orders endpoint
         * @return {Promise}       resolved once the request is sent
         */
        function sendRequest(order) {
            return resource.sendRequest({
                id: order.id
            }, order).$promise;
        }
    }
})();
