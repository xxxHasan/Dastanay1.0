export interface SubjectPreset {
  id: string;
  name: string;
  defaultTitle: string;
  sampleText: string;
  sampleYoutubeUrl?: string;
  sampleYoutubeTranscript?: string;
  lectureTitle?: string;
}

export const SUBJECT_PRESETS: Record<string, SubjectPreset> = {
  Physics: {
    id: 'physics',
    name: 'Physics',
    defaultTitle: 'Physics — Projectile Motion & Kinematics',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=1rYXZoUuVTE',
    lectureTitle: 'MIT 8.01 Physics I: Classical Mechanics — Projectile Trajectories',
    sampleYoutubeTranscript: `[00:00] Today we explore 2D kinematics and projectile motion.
[00:35] What happens when we project an object in a uniform gravitational field?
[01:10] The most fundamental observation is that horizontal and vertical motions are completely independent.
[02:00] The acceleration due to gravity, g = 9.8 m/s^2, acts strictly downwards. There is no horizontal acceleration if we ignore air drag.
[03:45] Therefore, v_x remains constant: v_x = v_0 * cos(theta).
[05:20] But vertically, the object undergoes freefall: v_y = v_0 * sin(theta) - g*t.
[07:15] At the maximum height or apex, v_y is instantaneously zero. But the velocity is not zero; it is still v_x!
[09:30] Let us derive the flight time T: T = 2 * v_0 * sin(theta) / g.
[12:10] And the total horizontal range R = v_0^2 * sin(2*theta) / g.
[15:40] Notice that sin(2*theta) has its maximum when theta is 45 degrees. So over flat ground, 45 degrees gives the farthest range.
[18:20] Notice also that complementary angles, like 30 and 60 degrees, give the exact same range!`,
    sampleText: `Projectile motion is motion under a constant gravitational acceleration g = 9.8 m/s^2.
Key Principles:
1. Horizontal velocity v_x = v_0 cos(theta) is constant.
2. Vertical velocity v_y = v_0 sin(theta) - gt changes continuously.
3. Path is an inverted parabola: y = x tan(theta) - (g x^2)/(2 v_0^2 cos^2(theta)).
4. Time of flight: T = 2 v_0 sin(theta) / g.
5. Max height: H = v_0^2 sin^2(theta) / (2g).
6. Range: R = v_0^2 sin(2 theta) / g. Max range at 45 degrees, where R = 4H.`,
  },
  'Computer Science': {
    id: 'cs',
    name: 'Computer Science',
    defaultTitle: 'Computer Science — Divide & Conquer, Binary Search',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=P3YID7liBug',
    lectureTitle: 'Harvard CS50: Algorithms, Asymptotic Notation and Binary Search',
    sampleYoutubeTranscript: `[00:00] Welcome to algorithms and asymptotic computational complexity.
[00:45] When searching an unsorted array of size N, the best we can do is linear search: O(N) comparisons.
[02:10] But if the array is sorted, we can divide the problem in half with every single probe.
[04:00] We look at the middle element. If our target is less, we discard the right half. If greater, we discard the left half.
[06:30] Since we divide the search space by 2 each time, the total number of steps is log base 2 of N, which is O(log N).
[09:15] For 1 billion records, linear search takes up to 1,000,000,000 steps. Binary search takes only 30 steps!
[12:00] Important edge case: when calculating mid, using (low + high) / 2 can cause integer overflow in languages like C/Java. Instead use low + (high - low) / 2.`,
    sampleText: `Binary Search & Asymptotic Complexity:
1. Prerequisite: The dataset must be monotonically sorted.
2. Divide-and-conquer paradigm: with each step, the search window [low, high] is halved.
3. Midpoint calculation: mid = low + ((high - low) >> 1) prevents 32-bit signed integer overflow.
4. Time Complexity: O(log N) in worst and average case, O(1) in best case (target at initial mid).
5. Space Complexity: O(1) iterative, O(log N) recursive due to call stack frames.`,
  },
  Mathematics: {
    id: 'math',
    name: 'Mathematics',
    defaultTitle: 'Mathematics — Differential Calculus & Optimization',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
    lectureTitle: 'Essence of Calculus — Derivatives and Critical Points',
    sampleYoutubeTranscript: `[00:00] What is a derivative at its geometrical core?
[01:10] The derivative f'(x) represents the instantaneous rate of change, or the slope of the tangent line to the curve at point x.
[03:20] When a function reaches a local maximum or minimum, the tangent line is horizontal. Its slope is zero: f'(x) = 0.
[05:40] These points are called critical points.
[08:15] To determine whether a critical point is a local maximum or minimum, we apply the Second Derivative Test.
[10:30] If f''(c) < 0, the curve is concave downward, indicating a local maximum. If f''(c) > 0, it is concave upward, indicating a local minimum.`,
    sampleText: `Calculus Optimization & Critical Points:
1. Derivative f'(x) = lim_{h->0} [f(x+h) - f(x)] / h represents instantaneous rate of change.
2. Critical points occur where f'(x) = 0 or f'(x) is undefined.
3. First Derivative Test: if f' changes from positive to negative, it is a local maximum.
4. Second Derivative Test: if f'(c) = 0 and f''(c) < 0, local maximum. If f''(c) > 0, local minimum.
5. Absolute extrema on closed interval [a, b] must occur either at critical points in (a, b) or at the endpoints a, b.`,
  },
  Chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    defaultTitle: 'Chemistry — Chemical Equilibrium & Le Chatelier’s Principle',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=7zuUV455zFs',
    lectureTitle: 'General Chemistry: Dynamic Equilibrium and Reaction Quotients',
    sampleYoutubeTranscript: `[00:00] Chemical equilibrium is a dynamic state where forward and reverse reaction rates are equal.
[01:30] Reactants are continuously becoming products, and products are continuously reforming reactants at the exact same speed.
[03:40] The equilibrium constant K_eq depends only on temperature.
[06:00] Le Chatelier’s Principle states that if an external stress is applied to a system at equilibrium, the system shifts in the direction that relieves that stress.
[08:20] If you increase pressure on gaseous reactions, the equilibrium shifts toward the side with fewer moles of gas.`,
    sampleText: `Chemical Equilibrium & Le Chatelier's Principle:
1. Dynamic nature: Rates of forward and reverse reactions are equal; concentrations of reactants and products remain constant.
2. Law of Mass Action: K_c = [C]^c [D]^d / ([A]^a [B]^b). K_c depends strictly on temperature.
3. Reaction Quotient Q: If Q < K, forward reaction proceeds. If Q > K, reverse reaction proceeds.
4. Le Chatelier's Principle: Increasing concentration of reactants shifts equilibrium to products; increasing pressure shifts toward fewer gas moles; increasing temperature favors endothermic direction.`,
  },
  Biology: {
    id: 'biology',
    name: 'Biology',
    defaultTitle: 'Biology — Cellular Respiration & ATP Synthesis',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=00jbG_cfGuQ',
    lectureTitle: 'Biochemistry: Glycolysis, Krebs Cycle & Oxidative Phosphorylation',
    sampleYoutubeTranscript: `[00:00] Cellular respiration converts biochemical energy from nutrients into ATP.
[01:15] Step 1: Glycolysis occurs in the cytoplasm, yielding 2 pyruvate, net 2 ATP, and 2 NADH. It is anaerobic.
[03:30] Step 2: Pyruvate oxidation and the Krebs (Citric Acid) Cycle occur in the mitochondrial matrix.
[05:50] Step 3: Oxidative phosphorylation occurs across the inner mitochondrial membrane. Electron transport chain creates a proton gradient.
[08:10] ATP Synthase utilizes the chemiosmotic proton motive force to synthesize approximately 30 to 32 ATP per glucose molecule.`,
    sampleText: `Cellular Respiration Overview:
1. Overall Equation: C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP.
2. Glycolysis: Cytoplasm, anaerobic. Net 2 ATP, 2 NADH, 2 Pyruvate.
3. Krebs Cycle: Mitochondrial matrix. Releases CO2, generates 2 ATP/GTP, 6 NADH, 2 FADH2 per glucose.
4. Oxidative Phosphorylation: Inner mitochondrial membrane. Electron Transport Chain pumps protons into intermembrane space; ATP Synthase utilizes chemiosmosis.`,
  },
  English: {
    id: 'english',
    name: 'English',
    defaultTitle: 'English Literature — Rhetorical Devices & Literary Analysis',
    sampleYoutubeUrl: 'https://www.youtube.com/watch?v=d_M_h2w7uP0',
    lectureTitle: 'Critical Reading: Rhetorical Strategies and Argumentation',
    sampleYoutubeTranscript: `[00:00] Rhetorical analysis examines how an author constructs an argument to persuade their target audience.
[01:20] Aristotle identified three primary rhetorical appeals: Ethos (credibility), Pathos (emotional resonance), and Logos (logical reasoning).
[03:45] Authors employ structural techniques like antithesis, anaphora, and epistrophe to create cadence and emphasize central claims.
[06:10] Diction and syntax establish tone and authorial perspective.`,
    sampleText: `Rhetorical Analysis & Critical Reading:
1. Aristotelian Appeals: Ethos (authority/ethics), Pathos (sympathy/emotion), Logos (data/logic/syllogism).
2. Rhetorical Devices: Metaphor, Anaphora (repetition at sentence starts), Chiasmus, Hypophora.
3. Structural Analysis: Claim, Evidence, Warrant, Rebuttal (Toulmin Model).
4. Tone & Diction: Connotative nuances distinguish descriptive journalism from polemical argument.`,
  },
};
