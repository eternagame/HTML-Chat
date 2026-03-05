import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import LoginForm from '#components/LoginForm.vue';

describe('LoginForm', () => {
  it('renders', () => {
    const wrapper = mount(LoginForm);
    expect(wrapper.exists()).toBeTruthy();
  });
});
