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

import { saveRequests, sendRequests } from './transfer-request-table-helper-functions';

describe('transfer request table helpers', function() {

    var transferService, orders;

    beforeEach(function() {
        transferService = jasmine.createSpyObj('transferService', ['updateRequest', 'sendRequest']);
        transferService.updateRequest.andReturn(Promise.resolve());
        transferService.sendRequest.andReturn(Promise.resolve());

        orders = [{
            id: 'first-id'
        }, {
            id: 'second-id'
        }];
    });

    describe('saveRequests', function() {

        it('should save every request through the transfer endpoint', function() {
            saveRequests(orders, transferService);

            expect(transferService.updateRequest).toHaveBeenCalledWith(orders[0]);
            expect(transferService.updateRequest).toHaveBeenCalledWith(orders[1]);
            expect(transferService.sendRequest).not.toHaveBeenCalled();
        });
    });

    describe('sendRequests', function() {

        it('should send every request through the transfer endpoint', function() {
            sendRequests(orders, transferService);

            expect(transferService.sendRequest).toHaveBeenCalledWith(orders[0]);
            expect(transferService.sendRequest).toHaveBeenCalledWith(orders[1]);
            expect(transferService.updateRequest).not.toHaveBeenCalled();
        });
    });
});
