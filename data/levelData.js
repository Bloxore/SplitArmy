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
        {x: 1, y: 3, units: 20}
      ],
      enemies: [
        {x: 4, y: 0, units: 15},
        {x: 3, y: 2, units: 15},
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
          data: "The number in the~lower-right corner~of a group~quantifies its units.~A group's attack~power and health~are tied to this~number.~Do your best to not~let it decrease."
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
      [12,12,12,12,12],
      [11,11,11,11,11],
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
      [13,1,1,1,13],
      [13,1,1,1,13],
      [13,1,1,1,13],
      [13,1,1,1,13],
      [13,1,1,1,13],
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
      [1,1,14,1,1],
      [1,1,1,1,1],
      [1,1,1,1,1],
      [1,1,1,1,1],
      [1,1,1,1,1],
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
      [0,0,0,0,0],
      [15,0,0,15,0],
      [0,0,0,0,0],
      [0,15,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 1, y: 4, units: 20}
      ],
      enemies: [
        {x: 3, y: 0, units: 10},
        {x: 1, y: 2, units: 15},
      ],
      name: "Forest Front",
      reinforcements: 0,
      events: [
        {
          round: 1,
          type: "dialogue",
          data: "Checkpoint~reached."
        },
        {
          round: 1,
          type: "dialogue",
          data: "From now on your~units will carry~from level to level.~~Be cautious how~you proceed."
        },
      ]
    },
    /* Mission 2, Stage 2 */
    {
      data: [
      [0,0,0,15,15],
      [0,15,0,0,0],
      [0,0,0,0,0],
      [0,0,15,15,0],
      [0,15,15,15,15],
      ],
      groups: [
        {x: 0, y: 1}
      ],
      enemies: [
        {x: 4, y: 3, units: 10},
        {x: 0, y: 4, units: 10},
        {x: 3, y: 1, units: 5}
      ],
      name: "Giford Forest",
      reinforcements: 0,
    },
    /* Mission 2, Stage 3*/
    {
      data: [
      [0,0,0,0,0],
      [6,6,6,1,6],
      [6,6,6,1,6],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 1, y: 3}
      ],
      enemies: [
        {x: 3, y: 0, units: 15},
        {x: 4, y: 3, units: 10}
      ],
      name: "River Crossing",
      reinforcements: 0,
    },
    /*{
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
    },*/
    /* Mission 2, Stage 4 */
    {
      data: [
      [11,11,11,11,11],
      [6,0,0,0,6],
      [6,0,0,0,6],
      [0,0,0,0,0],
      [0,0,0,0,0],
      ],
      groups: [
        {x: 2, y: 4}
      ],
      enemies: [
        {x: 1, y: 2, units: 10},
        {x: 2, y: 1, units: 15},
        {x: 3, y: 2, units: 10}
      ],
      name: "Giford Moat",
      reinforcements: 0,
    },
  ]
]
