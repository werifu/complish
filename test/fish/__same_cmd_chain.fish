## in production, $buffer should be the current commandline input
# set buffer (commandline -poc)

# match all args before '-' options
function get_cmd_chain
    set -l truncated_array
    set -l array (string split " " $argv)

    for arg in $array
        if string match -qr "^-" -- $arg
            break
        end
        set truncated_array $truncated_array $arg
    end

    echo $truncated_array
end

function __same_cmd_chain
    set -l input $argv[1]
    set -l baseline $argv[2]

    set -l parsed_input (get_cmd_chain $input)
    if test (echo $parsed_input) = (echo $baseline)
        return 0
    else
        return 1
    end
end
