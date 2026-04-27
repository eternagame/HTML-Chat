import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm.vue';

describe('LoginForm', () => {
  it('renders', () => {
    const wrapper = mount(LoginForm, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
    });
    expect(wrapper.exists()).toBeTruthy();
  });
});
