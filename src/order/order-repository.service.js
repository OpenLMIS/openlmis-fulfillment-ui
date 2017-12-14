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
     * @name order.orderRepository
     *
     * @description
     * Manages orders and serves as an abstraction layer between orderService and controllers.
     */
    angular
        .module('order')
        .service('orderRepository', orderRepository);

    orderRepository.$inject = ['orderService'];

    function orderRepository(orderService) {
        var orderRepository = this;

        orderRepository.search = search;

        /**
         * @ngdoc method
         * @methodOf order.orderRepository
         * @name search
         *
         * @description
         * Gets orders from the server using orderService and prepares them to be used in controller.
         *
         * @param {Object}   searchParams parameters for searching orders, i.e.
         * {
         *      program: 'programID',
         *      supplyingFacility: 'facilityID',
         *      requestingFacility: 'facilityID'
         * }
         * @return {Promise}              the promise resolving to a list of all matching orders
         */
        function search(searchParams) {
            return orderService.search(searchParams);
        }
    }

})();
