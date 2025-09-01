// inside initial state
const initial = {
  // ...
  coins: 0,
  cosmetics: { owned: [] },
  // ...
};

// in reducer:
function reducer(state, action) {
  switch (action.type) {
    // …
    case 'PURCHASE': {
      const item = action.item;
      if (!item) return state;
      if ((state.coins || 0) < item.cost) return state; // not enough
      const owned = new Set(state.cosmetics?.owned || []);
      owned.add(item.id);
      return {
        ...state,
        coins: (state.coins || 0) - item.cost,
        cosmetics: { ...state.cosmetics, owned: Array.from(owned) },
      };
    }
    // …
    default: return state;
  }
}

// in actions:
const actions = (dispatch) => ({
  // …
  purchase: (item) => {
    // return boolean so UI can give feedback
    return dispatch({ type:'PURCHASE', item }), true;
  },
  // …
});
