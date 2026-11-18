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

describe('orderTypeFactory', function() {

    function load(showTransfers) {
        module('order', function($provide) {
            $provide.constant('SHOW_TRANSFERS', showTransfers);
        });

        inject(function($injector) {
            this.orderTypeFactory = $injector.get('orderTypeFactory');
            this.ORDER_TYPE = $injector.get('ORDER_TYPE');
            this.messageService = $injector.get('messageService');
        });
    }

    describe('with transfers enabled', function() {

        beforeEach(function() {
            load.call(this, true);
        });

        it('should list every order type with its message', function() {
            spyOn(this.messageService, 'get').andCallFake(function(key) {
                return 'msg:' + key;
            });

            expect(this.orderTypeFactory.getAll()).toEqual([
                {
                    name: 'msg:orderType.REQUISITION',
                    value: this.ORDER_TYPE.REQUISITION
                },
                {
                    name: 'msg:orderType.REQUISITION_LESS',
                    value: this.ORDER_TYPE.REQUISITION_LESS
                },
                {
                    name: 'msg:orderType.TRANSFER_REQUEST',
                    value: this.ORDER_TYPE.TRANSFER_REQUEST
                },
                {
                    name: 'msg:orderType.TRANSFER_PUSH',
                    value: this.ORDER_TYPE.TRANSFER_PUSH
                }
            ]);
        });

        it('should be enabled', function() {
            expect(this.orderTypeFactory.isEnabled()).toBe(true);
        });

        it('should default to requisition and requisition-less orders when no type is chosen', function() {
            var params = {
                programId: 'program-id'
            };

            expect(this.orderTypeFactory.applyDefault(params)).toEqual({
                programId: 'program-id',
                type: [this.ORDER_TYPE.REQUISITION, this.ORDER_TYPE.REQUISITION_LESS]
            });

            expect(params).toEqual({
                programId: 'program-id'
            });
        });

        it('should keep the chosen type', function() {
            expect(this.orderTypeFactory.applyDefault({
                type: this.ORDER_TYPE.TRANSFER_REQUEST
            })).toEqual({
                type: this.ORDER_TYPE.TRANSFER_REQUEST
            });
        });
    });

    describe('with transfers disabled', function() {

        beforeEach(function() {
            load.call(this, false);
        });

        it('should not be enabled', function() {
            expect(this.orderTypeFactory.isEnabled()).toBe(false);
        });

        it('should not filter by type', function() {
            expect(this.orderTypeFactory.applyDefault({
                programId: 'program-id',
                type: this.ORDER_TYPE.TRANSFER_REQUEST
            })).toEqual({
                programId: 'program-id'
            });
        });
    });
});
