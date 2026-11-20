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
     * @module transfer-request
     *
     * @description
     * Provides the transfer request page: the user's home facility requests stock from one of its
     * transfer partners.
     */
    angular.module('transfer-request', [
        'transfer',
        'order',
        'stockmanagement',
        'openlmis-auth',
        'openlmis-rights',
        'openlmis-date',
        'referencedata-program',
        'referencedata-facility',
        'stock-card-summary',
        'openlmis-quantity-unit-toggle',
        'openlmis-quantity-unit-input'
    ]);

})();
