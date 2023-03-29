# match all args before '-' options
function __get_cmd_chain
    set -l truncated_array
    set -l array (string split " " $argv)

    for arg in $array
        if string match -qr "^-" -- $arg
            break
        end
        # remove empty arg so that any number of spaces between args is ok
        if test -z "$arg"
            continue
        end
        set truncated_array $truncated_array $arg
    end

    echo $truncated_array
end

function __same_cmd_chain
    set -l input $argv[1]
    set -l baseline $argv[2]

    set -l parsed_input (__get_cmd_chain $input)
    if test (echo $parsed_input) = (echo $baseline)
        return 0
    else
        return 1
    end
end
