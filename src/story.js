// Coordinates are normalized to the parent artwork. Children inherit its space.
export const story = {
  width: 1600, height: 1000,
  layers: [
    { id: 'city', title: '隔岸', subtitle: '整座城市，恰好隔着一次回眸。', image: '/art/bookshop.png', portal: { x: .60, y: .32, width: .17, height: .28, child: 'reflection', targetScale: 1 } },
    { id: 'reflection', title: '倒影', subtitle: '玻璃留住了光，也留住了你的身影。', image: '/art/bookshop.png', crop: { x: .60, y: .32, width: .17, height: .28 }, portal: { x: .40, y: .33, width: .22, height: .14, child: 'letter', targetScale: 1 } },
    { id: 'letter', title: '目光停留处', subtitle: '原来，你也停在同一秒。', image: '/art/bookshop.png', crop: { x: .668, y: .4124, width: .0374, height: .0392 } },
  ],
};
