import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import sinon from 'sinon';

import MainPage from './';
import { mount, shallow, mocks, renderToDOM } from '../../test-helpers';

const DefaultEntries = undefined;
const DefaultLocation = { pathname: '/' };
const DefaultHistory = { push: (url) => { } };

const mountMainPage = async ({ initialEntries = DefaultEntries, initialLocation = DefaultLocation, history = DefaultHistory } = { }) => {
	const mainPageWrapper = await mount(
		(<MemoryRouter initialEntries={initialEntries}>
			<MainPage location={initialLocation} history={history} />
		</MemoryRouter>));

	return mainPageWrapper.find('MainPage').at(0);
};

it('renders without crashing', () => {
	const div = document.createElement('div');
	renderToDOM(
		(<MemoryRouter>
			<MainPage location={{ pathname: '/explore' }} />
		</MemoryRouter>), div);
});

it('displays Explore if path is \'/\'', async () => {
	const location = { pathname: '/' };
	const mainPage = await mountMainPage({
		initialEntries: [location.pathname],
		initialLocation: location
	});

	expect(mainPage.find('Explore').length).toEqual(1);
	expect(mainPage.find('MyEvent').length).toEqual(0);
});

it('displays My Events if path is \'/events\'', async () => {
	const location = { pathname: '/events' };
	const mainPage = await mountMainPage({
		initialEntries: [location.pathname],
		initialLocation: location
	});

	expect(mainPage.find('MyEvents').length).toEqual(1);
	expect(mainPage.find('Explore').length).toEqual(0);
});

it('by default doesn\'t filter anything', async () => {
	const mainPage = await mountMainPage();

	const filterer = mainPage.node.state.filterer;
	expect(filterer(mocks.events)).toEqual(mocks.events);
});

it('filters events correctly', async () => {
	const mainPage = await mountMainPage();

	// this only tests description atm
	const testFiltering = (filterValue) => {
		mainPage.node.updateFilter(filterValue);
		expect(mainPage.node.state.filterer(mocks.events))
			.toEqual(mocks.events.filter(event => event.description.toLowerCase().includes(filterValue.toLowerCase())));
	};

	// this only tests description atm
	testFiltering(mocks.events[1].description.toLowerCase());
	testFiltering(mocks.events[2].description.slice(0, 5));
	testFiltering(mocks.events[3].description.slice(6).toUpperCase());
});

it('reacts to SearchBar change', async () => {
	const mainPage = await mountMainPage();

	const searchBar = mainPage.find('SearchBar').at(0);
	const searchBarInput = searchBar.find('input');
	searchBarInput.simulate('change', { target: { value: 'music' } });

	expect(mainPage.node.state.filterer(mocks.events))
		.toEqual(mocks.events.filter(event => event.category.name.toLowerCase().includes("music")));
});

it('changes path after tab is clicked', async () => {
	const location = { pathname: '/events' };
	const history = { push: sinon.spy() };

	const mainPage = await mountMainPage({
		initialLocation: location,
		history: history
	});

	mainPage.find('Tab').at(0).simulate('click');
	expect(history.push.calledOnce).toBe(true);
});

it('calls showEvent when onNewEventCreated is called', async () => {
		const wrapper = await shallow(<MainPage />);
		const mainPage = wrapper.shallow()
		const showEventSpy = sinon.spy(wrapper.instance(), 'showEvent');

		wrapper.instance().onNewEventCreated(mocks.event);
		await wrapper.wait(700);

		expect(showEventSpy.calledOnce).toBe(true);
});

it('changes key when onNewEventCreated is called', async () => {
		const wrapper = await shallow(<MainPage />);
		const oldKey = wrapper.instance().key;

		wrapper.instance().onNewEventCreated(mocks.event);

		expect(wrapper.instance().key !== oldKey).toBe(true);
});

it('forceUpdates when onNewEventCreated is called', async () => {
		const wrapper = await shallow(<MainPage />);
		const oldKey = wrapper.instance().key;
		const foreUpdateSpy = sinon.spy(Component.prototype, 'forceUpdate');

		expect(foreUpdateSpy.calledOnce).toBe(false);
		wrapper.instance().onNewEventCreated(mocks.event);
		expect(foreUpdateSpy.calledOnce).toBe(true);
});
