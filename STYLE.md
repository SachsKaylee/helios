# Code Style

Having a defined code style is really important. It's already important in a project you are just in on yourself(in order to still be able to read the code you've written 2 years later), but even more so in an open source project. So let's get started.

Some rules may be more lax than others. If anything doesn't make sense to you, feel free to open an issue and question why I've decided on a certain style aspect.

## It's a functional code base

This is the most important of all: Helios is functional.

Yeah, I know. A lot of JavaScript devs seem to get tired of the word functional these days. Everything is getting functional. But it has its advantages, and we will leverage them.

### No mutation

Pretty obvious huh? We don't mutate anything. I mean, who wants to have mutant code? That sounds rather icky.

### No classes

Aside from React components which must be classes in order to properly hold state we don't use classes. 

There are exceptions to this rule however. Sometimes we just cannot avoid using them(e.g. Promises).

## Code Format

Alright, alright. Enough of my dribbling on about how awesome functional code is.

Let's get to the meat of this document: The *actual* code.

### No var keyword

We're writing JavaScript so'll avoid `var` like the plague. 

If you are bent on unleashing mutation on the world use let, but there are typically betters ways to do things in that case.

### No function keyword

The `function` keyword looks rather ugly and also introduces a new "this" scope which can be rather irritating at times(altough we probably won't use this too often. Functional code base and all that).

Using `cost` also encourages to write shorther functions, which is always awesome.

Bad:
```js
function add(value1, value) {
  return value1 + value2;
}
```

Good:
```js
const add = (value1, value2) => value1 + value2;
```

### Semicolons are not optional

Always a point for debate among JavaScript devs, but this is just what it's gonna be for this project.

The two exceptions to this is after long functions(with curly braces around the body):

```js
const forwardData = (from, to) => {
  const data = loadData(from);
  sendData(to, data);
} // No semicolon here.
```

We also don't add a semicolon after `module.exports = { ... }`.

### Braces around JSX

Wrapping JSX in braces makes it easier to reason about where it starts and ends. It also helps to avoid issues with the `return` statement and newlines.

This also applies for JSX Elements created in expressions.

Bad:
```js
const CustomCard = ({ title, subtitle, children }) => <div className="card">
    <h1 className="title">{title || "Welcome!"}</h1>
    {subtitle && <h2 className="subtitle">{subtitle}</h2>}
    {children}
  </div>
```

Good:
```js
const CustomCard = ({ title, subtitle, children }) => // The newline is optional, but improves readability.
  (<div className="card">
    <h1 className="card">{title || "Welcome!"}</h1>
    {subtitle && (<h2 className="subtitle">{subtitle}</h2>)}
    {children}
  </div>);
```

### Indent using 2 spaces

I'm sure you've notices already, but: We use two spaces for indent and add line break like reasonable people.

I feel like giving an example so here we go:

Bad:
```js
const SaveMe = ({ example }) => { const why
                                            =
          example === "useless"
? "not found"
                              : "learning purposes"
                              ;
                              return isUseful(
        why
);}
```

Good:
```js
const SaveMe = ({ example }) => { 
  const why = example === "useless"
    ? "not found"
    : "learning purposes";
  return isUseful(why);
}
```

I'm sorry. I'm really sorry.