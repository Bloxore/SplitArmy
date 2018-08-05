/*
  Tilemap key
  0: Grass
  1: Water
*/
let levelData = [
  // Mission 1 start
  [
    /* Mission 1, Stage 1 */
    {
      data: [
      [0,0,0,0,0],
      [1,1,0,0,0],
      [1,1,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 1, y: 3, units: 15}
      ],
      enemies: [
        {x: 3, y: 0, units: 6},
        {x: 3, y: 2, units: 10},
      ],
      name: "Village",
      reinforcements: 0,
    },
    /* Mission 1, Stage 2 */
    {
      data: [
      [1,1,1,1,1],
      [1,1,1,1,1],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 2, y: 4, units: 16}
      ],
      enemies: [
        {x: 1, y: 2, units: 8},
        {x: 3, y: 2, units: 8},
      ],
      name: "Castle Wall",
      reinforcements: 0,
    },
    /* Mission 1, Stage 3 */
    {
      data: [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      ],
      groups: [
        {x: 1, y: 3, units: 5},
        {x: 3, y: 3, units: 5}
      ],
      enemies: [
        {x: 2, y: 1, units: 10},
      ],
      name: "Castle Corridor",
      reinforcements: 0,
    },
    /* Mission 1, Stage 4 */
    {
      data: [
      [0,0,1,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 2, y: 3, units: 20}
      ],
      enemies: [
        {x: 1, y: 1, units: 13},
        {x: 3, y: 1, units: 13}
      ],
      name: "Throne Room",
      reinforcements: 0,
    },
  ],
  //Mission 2 start
  [
    /* Mission 2, Stage 1 */
    {
      data: [
      [1,0,0,0,1],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,1,0,0],
      [0,1,1,1,0],
      ],
      groups: [
        {x: 0, y: 3, units: 20}
      ],
      enemies: [
        {x: 4, y: 1, units: 5},
        {x: 3, y: 2, units: 10}
      ],
      name: "Giford Forest",
      reinforcements: 0,
    },
    /* Mission 2, Stage 2 */
    {
      data: [
      [0,0,0,0,0],
      [1,1,1,0,1],
      [1,1,1,0,1],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 1, y: 3}
      ],
      enemies: [
        {x: 3, y: 0, units: 10},
        {x: 4, y: 3, units: 5}
      ],
      name: "River Crossing",
      reinforcements: 5,
    },
    /* Mission 2, Stage 3 */
    {
      data: [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,0,0,1],
      [1,0,0,1,1],
      [1,0,0,0,1],
      ],
      groups: [
        {x: 1, y: 3}
      ],
      enemies: [
        {x: 1, y: 0, units: 5},
        {x: 2, y: 1, units: 5}
      ],
      name: "Narrow Pass",
      reinforcements: 5,
    },
    /* Mission 2, Stage 4 */
    {
      data: [
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 2, y: 4}
      ],
      enemies: [
        {x: 1, y: 2, units: 4},
        {x: 2, y: 1, units: 4},
        {x: 3, y: 2, units: 4}
      ],
      name: "Giford Moat",
      reinforcements: 5,
    },
  ]
]
