//******************************************************************************
// MAL - step 4 - if/fn/do
//******************************************************************************
// This file is automatically generated from templates/step.swift. Rather than
// editing it directly, it's probably better to edit templates/step.swift and
// regenerate this file. Otherwise, your change might be lost if/when someone
// else performs that process.
//******************************************************************************

import Foundation

let kSymbolDef              = MalSymbol(symbol: "def!")
let kSymbolDo               = MalSymbol(symbol: "do")
let kSymbolFunction         = MalSymbol(symbol: "fn*")
let kSymbolIf               = MalSymbol(symbol: "if")
let kSymbolLet              = MalSymbol(symbol: "let*")

// Parse the string into an AST.
//
func READ(str: String) -> MalVal {
    return read_str(str)
}

// Perform a simple evaluation of the `ast` object. If it's a symbol,
// dereference it and return its value. If it's a collection, call EVAL on all
// elements (or just the values, in the case of the hashmap). Otherwise, return
// the object unchanged.
//
func eval_ast(ast: MalVal, env: Environment) -> MalVal {
    if is_symbol(ast) {
        let symbol = ast as MalSymbol
        if let val = env.get(symbol) {
            return val
        }
        return MalError(message: "'\(symbol)' not found")    // Specific text needed to match MAL unit tests
    }
    if is_list(ast) {
        let list = ast as MalList
        var result = [MalVal]()
        result.reserveCapacity(list.count)
        for item in list {
            let eval = EVAL(item, env)
            if is_error(eval) { return eval }
            result.append(eval)
        }
        return MalList(array: result)
    }
    if is_vector(ast) {
        let vec = ast as MalVector
        var result = [MalVal]()
        result.reserveCapacity(vec.count)
        for item in vec {
            let eval = EVAL(item, env)
            if is_error(eval) { return eval }
            result.append(eval)
        }
        return MalVector(array: result)
    }
    if is_hashmap(ast) {
        let hash = ast as MalHashMap
        var result = [MalVal]()
        result.reserveCapacity(hash.count * 2)
        for (k, v) in hash {
            let new_v = EVAL(v, env)
            if is_error(new_v) { return new_v }
            result.append(k)
            result.append(new_v)
        }
        return MalHashMap(array: result)
    }
    return ast
}

// Walk the AST and completely evaluate it, handling macro expansions, special
// forms and function calls.
//
func EVAL(var ast: MalVal, var env: Environment) -> MalVal {
        if is_error(ast) { return ast }

        // Special handling if it's a list.

        if is_list(ast) {
            var list = ast as MalList

            if list.isEmpty {
                return ast
            }

            let arg1 = list.first()
            if is_symbol(arg1) {
                let fn_symbol = arg1 as MalSymbol

                // Check for special forms, where we want to check the operation
                // before evaluating all of the parameters.

                if fn_symbol == kSymbolDef {
                    if list.count != 3 {
                        return MalError(message: "expected 2 arguments to def!, got \(list.count - 1)")
                    }
                    let arg1 = list[1]
                    let arg2 = list[2]
                    if !is_symbol(arg1) {
                        return MalError(message: "expected symbol for first argument to def!")
                    }
                    let sym = arg1 as MalSymbol
                    let value = EVAL(arg2, env)
                    if is_error(value) { return value }
                    return env.set(sym, value)
                } else if fn_symbol == kSymbolLet {
                    if list.count != 3 {
                        return MalError(message: "expected 2 arguments to let*, got \(list.count - 1)")
                    }
                    let arg1 = list[1]
                    let arg2 = list[2]
                    if !is_sequence(arg1) {
                        return MalError(message: "expected list for first argument to let*")
                    }
                    let bindings = arg1 as MalSequence
                    if bindings.count % 2 == 1 {
                        return MalError(message: "expected even number of elements in bindings to let*, got \(bindings.count)")
                    }
                    var new_env = Environment(outer: env)
                    for var index = 0; index < bindings.count; index += 2 {
                        let binding_name = bindings[index]
                        let binding_value = bindings[index + 1]

                        if !is_symbol(binding_name) {
                            return MalError(message: "expected symbol for first element in binding pair")
                        }
                        let binding_symbol = binding_name as MalSymbol
                        let evaluated_value = EVAL(binding_value, new_env)
                        if is_error(evaluated_value) { return evaluated_value }
                        new_env.set(binding_symbol, evaluated_value)
                    }
                    return EVAL(arg2, new_env)
                } else if fn_symbol == kSymbolDo {
                    let evaluated_ast = eval_ast(list.rest(), env)
                    if is_error(evaluated_ast) { return evaluated_ast }
                    let evaluated_seq = evaluated_ast as MalSequence
                    return evaluated_seq.last()
                } else if fn_symbol == kSymbolIf {
                    if list.count < 3 {
                        return MalError(message: "expected at least 2 arguments to if, got \(list.count - 1)")
                    }
                    let cond_result = EVAL(list[1], env)
                    var new_ast = MalVal()
                    if is_truthy(cond_result) {
                        new_ast = list[2]
                    } else if list.count == 4 {
                        new_ast = list[3]
                    } else {
                        return MalNil()
                    }
                    return EVAL(new_ast, env)
                } else if fn_symbol == kSymbolFunction {
                    if list.count != 3 {
                        return MalError(message: "expected 2 arguments to fn*, got \(list.count - 1)")
                    }
                    if !is_sequence(list[1]) {
                        return MalError(message: "expected list or vector for first argument to fn*")
                    }
                    return MalClosure(eval: EVAL, args:list[1] as MalSequence, body:list[2], env:env)
                }
            }

            // Standard list to be applied. Evaluate all the elements first.

            let eval = eval_ast(ast, env)
            if is_error(eval) { return eval }

            // The result had better be a list and better be non-empty.

            let eval_list = eval as MalList
            if eval_list.isEmpty {
                return eval_list
            }

            // Get the first element of the list and execute it.

            let first = eval_list.first()
            let rest = eval_list.rest()

            if is_builtin(first) {
                let fn = first as MalBuiltin
                let answer = fn.apply(rest)
                return answer
            } else if is_closure(first) {
                let fn = first as MalClosure
                var new_env = Environment(outer: fn.env)
                let result = new_env.set_bindings(fn.args, with_exprs:rest)
                if is_error(result) { return result }
                let answer = EVAL(fn.body, new_env)
                return answer
            }

            // The first element wasn't a function to be executed. Return an
            // error saying so.

            return MalError(message: "first list item does not evaluate to a function: \(first)")
        }

        // Not a list -- just evaluate and return.

        let answer = eval_ast(ast, env)
        return answer
}

// Convert the value into a human-readable string for printing.
//
func PRINT(exp: MalVal) -> String? {
    if is_error(exp) { return nil }
    return pr_str(exp, true)
}

// Perform the READ and EVAL steps. Useful for when you don't care about the
// printable result.
//
func RE(text: String, env: Environment) -> MalVal? {
    if text.isEmpty { return nil }
    let ast = READ(text)
    if is_error(ast) {
        println("Error parsing input: \(ast)")
        return nil
    }
    let exp = EVAL(ast, env)
    if is_error(exp) {
        println("Error evaluating input: \(exp)")
        return nil
    }
    return exp
}

// Perform the full READ/EVAL/PRINT, returning a printable string.
//
func REP(text: String, env: Environment) -> String? {
    let exp = RE(text, env)
    if exp == nil { return nil }
    return PRINT(exp!)
}

// Perform the full REPL.
//
func REPL(env: Environment) {
    while true {
        if let text = _readline("user> ") {
            if let output = REP(text, env) {
                println("\(output)")
            }
        } else {
            println()
            break
        }
    }
}

func main() {
    var env = Environment(outer: nil)

    load_history_file()
    load_builtins(env)

    RE("(def! not (fn* (a) (if a false true)))", env)
    REPL(env)

    save_history_file()
}