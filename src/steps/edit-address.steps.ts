import { Then, When } from '@cucumber/cucumber';
import type { AddressType } from '../pages/edit-account.page';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { editPage } from '../support/edit-page';
import type { BonboniteWorld } from '../support/world';

// --- Address action steps ---

When(
  'they open the {word} address modal',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).openAddressModal(addressType);
  },
);

When(
  'they fill the {word} address with valid data',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const data = config[addressType];
    const fields: Record<string, string> = {
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
    };
    if ('phone' in data) fields.phone = (data as { phone: string }).phone;
    await editPage(this).fillAddress(addressType, fields as any);
  },
);

When(
  'they clear the {word} address fields',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).clearAddressFields(addressType);
  },
);

When(
  'they save the {word} address',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).saveAddress(addressType);
  },
);

When(
  'they delete the {word} address',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).deleteAddress(addressType);
  },
);

When(
  'they enter non-numeric characters in the {word} phone field',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).fillAddress(addressType, { phone: 'abcDEF123' } as any);
  },
);

// --- Address assertions: happy paths ---

Then(
  'the {word} address is saved successfully',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    await editPage(this).closeAddressModal();
    const firstName = await editPage(this).getAddressFieldValue(addressType, 'firstName');
    expect(firstName).toBeTruthy();
  },
);

Then(
  'the {word} address is removed',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const configured = await editPage(this).isAddressFieldVisible(addressType, 'firstName');
    expect(configured).toBe(false);
  },
);

// --- Address assertions: bug scenarios ---

Then(
  'the {word} delete button should not be visible',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const visible = await editPage(this).isDeleteButtonVisible(addressType);
    expect(visible).toBe(false);
  },
);

Then(
  'the {word} edit button should say Add',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const text = await editPage(this).getEditButtonText(addressType);
    expect(text.toLowerCase()).not.toContain('editar');
  },
);

Then(
  'an address validation error is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const hasError = await editPage(this).hasAddressValidationError();
    expect(hasError).toBe(true);
  },
);

Then(
  'the {word} city dropdown should have city options',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const options = await editPage(this).getCityOptions(addressType);
    const realCities = options.filter((o) => !o.includes('Elige una'));
    expect(realCities.length).toBeGreaterThan(0);
  },
);

Then(
  'the {word} email field should be pre-filled',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const email = await editPage(this).getAddressFieldValue(addressType, 'email');
    expect(email).toBeTruthy();
  },
);
