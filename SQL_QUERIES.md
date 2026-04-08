# SQL Query: Event Titles and Goal Numbers

## Basic Query - Event Title with Goal Numbers

```sql
SELECT 
  e.title,
  STRING_AGG(s.goalNumber::text, ', ' ORDER BY s.goalNumber) as goal_numbers
FROM events e
LEFT JOIN event_goals eg ON e.id = eg.eventId
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
GROUP BY e.id, e.title
ORDER BY e.title;
```

**Output Example:**
```
title                                      | goal_numbers
-------------------------------------------|-------------
Innovation Workshop on AI & ML             | 4, 17
Sairam SDG Ideathon 3.0 - Inauguration    | 3
```

---

## With More Details - Including Event Code and Year

```sql
SELECT 
  e.eventCode,
  e.title,
  e.year,
  STRING_AGG(s.goalNumber::text, ', ' ORDER BY s.goalNumber) as goal_numbers,
  STRING_AGG(s.name, ', ' ORDER BY s.goalNumber) as goal_names
FROM events e
LEFT JOIN event_goals eg ON e.id = eg.eventId
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
GROUP BY e.id, e.eventCode, e.title, e.year
ORDER BY e.eventCode;
```

**Output Example:**
```
eventCode | title                              | year | goal_numbers | goal_names
----------|---------------------------------------|------|--------------|---------------------------
24INN0001 | Sairam SDG Ideathon 3.0...           | 2024 | 3            | Good Health and Well-being
24INN0002 | Innovation Workshop on AI & ML        | 2024 | 4, 17        | Quality Education, Partnerships for the Goals
```

---

## Filter by Unit - Innovation Ecosystem Only

```sql
SELECT 
  e.eventCode,
  e.title,
  STRING_AGG(s.goalNumber::text, ', ' ORDER BY s.goalNumber) as goal_numbers
FROM events e
JOIN units u ON e.unitId = u.id
LEFT JOIN event_goals eg ON e.id = eg.eventId
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
WHERE u.code = 'INNOVATION_ECOSYSTEM'
GROUP BY e.id, e.eventCode, e.title
ORDER BY e.eventCode;
```

---

## Show Primary Goal Only

```sql
SELECT 
  e.eventCode,
  e.title,
  s.goalNumber as primary_goal,
  s.name as primary_goal_name
FROM events e
LEFT JOIN event_goals eg ON e.id = eg.eventId AND eg.isPrimary = true
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
ORDER BY e.eventCode;
```

**Output Example:**
```
eventCode | title                              | primary_goal | primary_goal_name
----------|---------------------------------------|--------------|-------------------
24INN0001 | Sairam SDG Ideathon 3.0...           | 3            | Good Health and Well-being
24INN0002 | Innovation Workshop on AI & ML        | 4            | Quality Education
```

---

## With Participant Counts

```sql
SELECT 
  e.title,
  STRING_AGG(s.goalNumber::text, ', ' ORDER BY s.goalNumber) as goal_numbers,
  e.studentCount,
  e.facultyCount,
  e.externalCount,
  e.totalParticipants
FROM events e
LEFT JOIN event_goals eg ON e.id = eg.eventId
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
GROUP BY e.id, e.title, e.studentCount, e.facultyCount, e.externalCount, e.totalParticipants
ORDER BY e.title;
```

---

## Run Query Using Prisma CLI

```bash
cd /path/to/project

# Basic query
npx prisma db execute --stdin <<'EOF'
SELECT 
  e.title,
  STRING_AGG(s."goalNumber"::text, ', ' ORDER BY s."goalNumber") as goal_numbers
FROM "events" e
LEFT JOIN "event_goals" eg ON e.id = eg."eventId"
LEFT JOIN "sdg_goals" s ON eg."sdgGoalId" = s.id
GROUP BY e.id, e.title
ORDER BY e.title;
EOF
```

**Note:** Add quotes around column names if your schema uses camelCase in Postgres.

---

## Alternative: Separate Rows for Each Goal

If you want each goal on a separate row instead of aggregated:

```sql
SELECT 
  e.eventCode,
  e.title,
  s.goalNumber,
  s.name as goal_name,
  eg.isPrimary
FROM events e
LEFT JOIN event_goals eg ON e.id = eg.eventId
LEFT JOIN sdg_goals s ON eg.sdgGoalId = s.id
ORDER BY e.eventCode, s.goalNumber;
```

**Output Example:**
```
eventCode | title                        | goalNumber | goal_name          | isPrimary
----------|------------------------------|------------|--------------------|-----------
24INN0001 | Sairam SDG Ideathon 3.0...  | 3          | Good Health...     | true
24INN0002 | Innovation Workshop...       | 4          | Quality Education  | true
24INN0002 | Innovation Workshop...       | 17         | Partnerships...    | false
```

---

## Using Node.js with Prisma Client

```javascript
const prisma = require('@prisma/client').PrismaClient();

async function getEventsWithGoals() {
  const events = await prisma.event.findMany({
    select: {
      title: true,
      goals: {
        select: {
          sdgGoal: {
            select: {
              goalNumber: true,
              name: true
            }
          }
        },
        orderBy: {
          sdgGoal: {
            goalNumber: 'asc'
          }
        }
      }
    }
  });
  
  // Format output
  events.forEach(event => {
    const goalNumbers = event.goals.map(g => g.sdgGoal.goalNumber).join(', ');
    console.log(`${event.title}: Goals ${goalNumbers}`);
  });
}

getEventsWithGoals();
```

---

## Quick Test Query

**Simplest version to test:**

```sql
SELECT title FROM events;
```

**Then with goals:**

```sql
SELECT e.title, s.goalNumber
FROM events e
JOIN event_goals eg ON e.id = eg.eventId
JOIN sdg_goals s ON eg.sdgGoalId = s.id;
```

**Finally aggregated:**

```sql
SELECT 
  e.title,
  STRING_AGG(s.goalNumber::text, ', ') as goals
FROM events e
JOIN event_goals eg ON e.id = eg.eventId
JOIN sdg_goals s ON eg.sdgGoalId = s.id
GROUP BY e.title;
```
