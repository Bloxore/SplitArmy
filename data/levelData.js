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
      [7,8,0,0,0],
      [9,10,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 1, y: 3, units: 15}
      ],
      enemies: [
        {x: 4, y: 0, units: 10},
        {x: 3, y: 2, units: 10},
      ],
      name: "Village",
      reinforcements: 0,
      //Events occur once at the start of a round
      events: [
        //Tutorial events
        {
          round: 1,
          type: "dialogue",
          data: "Your town is~under attack!~Defeat all enemies~on the field to~proceed to the next~stage."
        },
        {
          round: 1,
          type: "target",
          data: [1,3]
        },
        {
          round: 1,
          type: "dialogue",
          data: "This is your~group of soldiers."
        },
        {
          round: 1,
          type: "target",
          data: [3,2]
        },
        {
          round: 1,
          type: "target",
          data: [4,0]
        },
        {
          round: 1,
          type: "dialogue",
          data: "These are your~enemies."
        },
        {
          round: 1,
          type: "target",
          data: [3,2]
        },
        {
          round: 1,
          type: "dialogue",
          data: "Select your group~and move it to this~spot to attack the~enemy."
        },
        {
          round: 1,
          type: "limit",
          data: "move"
        },
        {
          round: 2,
          type: "dialogue",
          data: "Once your turn~has ended, your~enemies will get~a chance to attack~your groups."
        },
        {
          round: 2,
          type: "dialogue",
          data: "The amount of~damage dealt is~equal to the~number of soldiers~in a group.~~This quantity is~represented by a~number in the~lower right corner~of the group.~~Additionally, this~number represents~a group's health."
        },
        {
          round: 2,
          type: "limit",
          data: "move"
        },
      ]
    },
    /* Mission 1, Stage 2 */
    {
      data: [
      [6,6,6,6,6],
      [6,6,6,6,6],
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
      events: [
        {
          round: 1,
          type: "dialogue",
          data: "Sometimes, work~is best done apart."
        },
        {
          round: 1,
          type: "target",
          data: [2,3]
        },
        {
          round: 1,
          type: "dialogue",
          data: "Try moving half~the group here~by selecting 'Split'~from the menu~that appears when~moving."
        },
      ]
    },
    /* Mission 1, Stage 3 */
    {
      data: [
      [6,0,0,0,6],
      [6,0,0,0,6],
      [6,0,0,0,6],
      [6,0,0,0,6],
      [6,0,0,0,6],
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
      events: [
        {
          round: 1,
          type: "dialogue",
          data: "You may also join~a pair of groups."
        },
        {
          round: 1,
          type: "target",
          data: [2,2]
        },
        {
          round: 1,
          type: "dialogue",
          data: "Move both groups~to this spot to~join them together."
        },
      ]
    },
    /* Mission 1, Stage 4 */
    {
      data: [
      [0,0,6,0,0],
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
      events: [
        {
          round: 1,
          type: "dialogue",
          data: "You may have~noticed the number~at the top left~of a group."
        },
        {
          round: 1,
          type: "target",
          data: [2,3]
        },
        {
          round: 1,
          type: "dialogue",
          data: "This is your action~counter.~Moving, splitting,~and attacking cost~one action.~~If the action~counter reaches 0~the group can not~move for the rest~of the player's~turn."
        },
      ]
    },
  ],
  //Mission 2 start
  [
    /* Mission 2, Stage 1 */
    {
      data: [
      [6,0,0,0,6],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,6,0,0],
      [0,6,6,6,0],
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
      [6,6,6,0,6],
      [6,6,6,0,6],
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
      [6,0,0,0,6],
      [6,0,0,0,6],
      [6,6,0,0,6],
      [6,0,0,6,6],
      [6,0,0,0,6],
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
      [6,6,6,6,6],
      [6,0,0,0,6],
      [6,0,0,0,6],
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
